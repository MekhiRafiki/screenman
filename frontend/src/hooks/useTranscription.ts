import { useState, useCallback, useRef, useEffect } from 'react';
import { TranscriptionLine } from '@/types/transcription';
import { useTranscriptionContext } from '@/context/TranscriptionContext';

export const useTranscription = () => {
  const { mode } = useTranscriptionContext();
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState('Click to start transcription');
  const [lines, setLines] = useState<TranscriptionLine[]>([]);
  const [buffer, setBuffer] = useState('');
  
  const websocketRef = useRef<WebSocket | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const userClosingRef = useRef(false);
  const fileSimulationRef = useRef<NodeJS.Timeout | null>(null);

  const setupWebSocket = useCallback(async (websocketUrl: string) => {
    return new Promise<void>((resolve, reject) => {
      try {
        const ws = new WebSocket(websocketUrl);
        websocketRef.current = ws;

        ws.onopen = () => {
          setStatus('Connected to server.');
          resolve();
        };

        ws.onclose = () => {
          if (userClosingRef.current) {
            setStatus('WebSocket closed by user.');
          } else {
            setStatus('Disconnected from the WebSocket server. (Check logs if model is loading.)');
          }
          userClosingRef.current = false;
        };

        ws.onerror = () => {
          setStatus('Error connecting to WebSocket.');
          reject(new Error('Error connecting to WebSocket'));
        };

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          setLines(data.lines || []);
          setBuffer(data.buffer || '');
        };
      } catch (error) {
        setStatus('Invalid WebSocket URL. Please check and try again.');
        reject(error);
      }
    });
  }, []);

  const stopRecording = useCallback(() => {
    userClosingRef.current = true;
    
    if (mode === 'file' && fileSimulationRef.current) {
      clearTimeout(fileSimulationRef.current);
      fileSimulationRef.current = null;
    } else {
      if (recorderRef.current) {
        recorderRef.current.stop();
        recorderRef.current = null;
      }

      if (websocketRef.current) {
        websocketRef.current.close();
        websocketRef.current = null;
      }
    }

    setIsRecording(false);
    setStatus('Click to start transcription');
  }, [mode]);

    // File simulation functions
    const simulateFileTranscription = useCallback(async () => {
      try {
        const response = await fetch('/data/jbp_eagles.txt');
        const text = await response.text();
        const allLines = text.split('\n').filter(line => line.trim());
        
        const processLines = async () => {
          for (let i = 0; i < allLines.length ; i++) { // && isRecording
            setLines(prev => [...prev, {
              speaker: 1,
              text: allLines[i],
            }]);
            
            // Wait for 1 second before next line
            await new Promise(resolve => {
              fileSimulationRef.current = setTimeout(resolve, 1000);
            });
          }
          
          // If we've reached the end of the file, stop recording
          if (isRecording) {
            stopRecording();
          }
          console.log('Finished processing all lines');
        };

        // Start processing lines
        void processLines();
      } catch (error) {
        console.error('Error reading file:', error);
        setStatus('Error reading file');
        stopRecording();
      }
    }, [isRecording, stopRecording]);

  const startRecording = useCallback(async (websocketUrl?: string, chunkDuration?: number) => {
    if (mode === 'file') {
      setIsRecording(true);
      setStatus('Simulating transcription from file...');
      void simulateFileTranscription();
    } else {
      try {
        if (!websocketUrl || !chunkDuration) {
          throw new Error('WebSocket URL and chunk duration required for microphone mode');
        }
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        
        recorder.ondataavailable = (e) => {
          if (websocketRef.current?.readyState === WebSocket.OPEN) {
            websocketRef.current.send(e.data);
          }
        };

        await setupWebSocket(websocketUrl);
        recorder.start(chunkDuration);
        recorderRef.current = recorder;
        setIsRecording(true);
        setStatus('Recording...');
      } catch (err) {
        setStatus('Error accessing microphone. Please allow microphone access.');
        throw err;
      }
    }
  }, [mode, setupWebSocket, simulateFileTranscription]);

  const toggleRecording = useCallback(async (websocketUrl?: string, chunkDuration?: number) => {
    if (!isRecording) {
      setLines([]);
      setBuffer('');
      try {
        await startRecording(websocketUrl, chunkDuration);
      } catch (err) {
        setStatus('Could not start transcription. Aborted.');
      }
    } else {
      stopRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isRecording) {
        stopRecording();
      }
    };
  }, [isRecording, stopRecording]);

  return {
    isRecording,
    status,
    lines,
    buffer,
    toggleRecording
  };
};
