import { useState, useCallback, useRef } from 'react';
import { TranscriptionLine, TranscriptionResponse } from '@/types/transcription';

export const useTranscription = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState('Click to start transcription');
  const [lines, setLines] = useState<TranscriptionLine[]>([]);
  const [buffer, setBuffer] = useState('');
  
  const websocketRef = useRef<WebSocket | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const userClosingRef = useRef(false);

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
          const data: TranscriptionResponse = JSON.parse(event.data);
          setLines(data.lines || []);
          setBuffer(data.buffer || '');
        };
      } catch (error) {
        setStatus('Invalid WebSocket URL. Please check and try again.');
        reject(error);
      }
    });
  }, []);

  const startRecording = useCallback(async (chunkDuration: number) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      
      recorder.ondataavailable = (e) => {
        if (websocketRef.current?.readyState === WebSocket.OPEN) {
          websocketRef.current.send(e.data);
        }
      };

      recorder.start(chunkDuration);
      recorderRef.current = recorder;
      setIsRecording(true);
      setStatus('Recording...');
    } catch (err) {
      setStatus('Error accessing microphone. Please allow microphone access.');
      throw err;
    }
  }, []);

  const stopRecording = useCallback(() => {
    userClosingRef.current = true;
    
    if (recorderRef.current) {
      recorderRef.current.stop();
      recorderRef.current = null;
    }

    if (websocketRef.current) {
      websocketRef.current.close();
      websocketRef.current = null;
    }

    setIsRecording(false);
    setStatus('Click to start transcription');
  }, []);

  const toggleRecording = useCallback(async (websocketUrl: string, chunkDuration: number) => {
    if (!isRecording) {
      setLines([]);
      setBuffer('');
      try {
        await setupWebSocket(websocketUrl);
        await startRecording(chunkDuration);
      } catch (err) {
        setStatus('Could not connect to WebSocket or access mic. Aborted.');
      }
    } else {
      stopRecording();
    }
  }, [isRecording, setupWebSocket, startRecording, stopRecording]);

  return {
    isRecording,
    status,
    lines,
    buffer,
    toggleRecording
  };
};
