import { useState, useCallback, useRef, useEffect } from 'react'
import { TranscriptionLine } from '@/types/transcription'
import { useTranscriptionContext } from '@/context/TranscriptionContext'
import { usePostHog } from 'posthog-js/react'
import { AssemblyAI, RealtimeTranscriber, RealtimeTranscript } from 'assemblyai';
import { getAssemblyToken } from '@/app/actions/assemblyAI';

export const useTranscription = () => {
  const posthog = usePostHog();
  const { mode, transcriptOption } = useTranscriptionContext();
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState('Click to start transcription');
  const [lines, setLines] = useState<TranscriptionLine[]>([]);
  const [buffer, setBuffer] = useState('');
  
  const transcriberRef = useRef<RealtimeTranscriber | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const userClosingRef = useRef(false);
  const fileSimulationRef = useRef<NodeJS.Timeout | null>(null);

  const setupWebSocket = useCallback(async () => {
    try {
      const apiKey = await getAssemblyToken();
      if (!apiKey) {
        throw new Error('Failed to get AssemblyAI temporary token');
      }
      const client = new AssemblyAI({
        apiKey
      })

      // Initialize WebSocket connection
      const transcriber = client.realtime.transcriber({
        sampleRate: 16000
      })
      /**
       * Minimum quality: 8_000 (8 kHz)
       * Medium quality: 16_000 (16 kHz)
       * Maximum quality: 48_000 (48 kHz)
       */

      // Send authentication message immediately after connection
      transcriber.on('open', () => {
        setStatus('Connected to AssemblyAI');
      })

      transcriber.on('error', (error) => {
        console.error('WebSocket Error:', error);
        setStatus('Error connecting to AssemblyAI');
      })

      transcriber.on('close', () => {
        if (userClosingRef.current) {
          setStatus('Transcription stopped by user.');
        } else {
          setStatus('Disconnected from AssemblyAI.');
        }
        userClosingRef.current = false;
      })

      transcriber.on('transcript', (transcript: RealtimeTranscript) => {
        if (!transcript.text) {
          return
        }

        switch (transcript.message_type) {
          case 'PartialTranscript':
            console.log('Partial:', transcript.text);
            if (transcript.text) {
              setBuffer(transcript.text);
            }
            break;

          case 'FinalTranscript':
            console.log('Final:', transcript.text);
            if (transcript.text) {
              const newLine: TranscriptionLine = {
                speaker: 1,
                text: transcript.text,
                beg: transcript.audio_start?.toString() ?? undefined,
                end: transcript.audio_end?.toString() ?? undefined,
                diff: transcript.audio_end && transcript.audio_start ? transcript.audio_end - transcript.audio_start : undefined
              };
              setLines(prev => [...prev, newLine]);
              setBuffer('');
            }
            break;

          default:
            break;
        }
      })
      await transcriber.connect();
      transcriberRef.current = transcriber;
    } catch (error) {
      console.error('Failed to setup WebSocket:', error);
      setStatus(`Failed to connect: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }, []);

  const stopRecording = useCallback(() => {
    userClosingRef.current = true;
    
    if (mode === 'file' && fileSimulationRef.current) {
      clearTimeout(fileSimulationRef.current);
      fileSimulationRef.current = null;
    } else {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }

      if (processorRef.current && audioContextRef.current) {
        processorRef.current.disconnect();
        audioContextRef.current.close();
        processorRef.current = null;
        audioContextRef.current = null;
      }

      if (transcriberRef.current) {
        transcriberRef.current.close();
        transcriberRef.current = null;
      }
    }

    setIsRecording(false);
    setStatus('Click to start transcription');
  }, [mode]);

    // File simulation functions
    const simulateFileTranscription = useCallback(async () => {
      try {
        // Use the selected transcript option's path
        const response = await fetch(transcriptOption.path);
        const text = await response.text();
        const allLines = text.split('\n').filter(line => line.trim());
        
        const processLines = async () => {
          const BATCH_SIZE = 1;
          for (let i = 0; i < allLines.length; i += BATCH_SIZE) {
            const batch = allLines.slice(i, i + BATCH_SIZE);
            setLines(prev => [
              ...prev,
              ...batch.map(line => ({
                speaker: 1,
                text: line,
              }))
            ]);
            
            // Wait for 1 second before next batch
            await new Promise(resolve => {
              fileSimulationRef.current = setTimeout(resolve, 1200);
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
    }, [isRecording, stopRecording, transcriptOption]);



  const startRecording = useCallback(async () => {
    if (mode === 'file') {
      setIsRecording(true);
      setStatus('Simulating transcription from file...');
      void simulateFileTranscription();
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            sampleRate: 16000,
            channelCount: 1
          }
        });
        mediaStreamRef.current = stream;

        await setupWebSocket();
        
        // Convert audio stream to raw PCM data and send to AssemblyAI
        const audioContext = new AudioContext({ sampleRate: 16000 });
        const source = audioContext.createMediaStreamSource(stream);
        const processor = audioContext.createScriptProcessor(4096, 1, 1);

        audioContextRef.current = audioContext;
        processorRef.current = processor;

        source.connect(processor);
        processor.connect(audioContext.destination);

        processor.onaudioprocess = (e) => {
          if (transcriberRef.current) {
            const inputData = e.inputBuffer.getChannelData(0);
            const buffer = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
              buffer[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
            }
            transcriberRef.current?.sendAudio(buffer);
          }
        };

        setIsRecording(true);
        setStatus('Recording and transcribing...');
      } catch (err) {
        setStatus('Error accessing microphone. Please allow microphone access.');
        throw err;
      }
    }
  }, [mode, setupWebSocket, simulateFileTranscription]);

  const toggleRecording = useCallback(async () => {
    if (!isRecording) {
      setLines([]);
      setBuffer('');
      try {
        posthog.capture("transcription_started", {
          mode
        })
        await startRecording();
      } catch (err) {
        console.error(err);
        setStatus('Could not start transcription. Aborted.');
      }
    } else {
      posthog.capture("transcription_stopped")
      stopRecording();
    }
  }, [isRecording, startRecording, stopRecording, posthog, mode]);

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
