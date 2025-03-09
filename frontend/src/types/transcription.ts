export interface TranscriptionLine {
  speaker: number;
  text: string;
  beg?: string;
  end?: string;
  diff?: number;
}

export interface TranscriptionResponse {
  lines: TranscriptionLine[];
  buffer: string;
}

// AssemblyAI WebSocket message types
export interface AssemblyAIMessage {
  audio_start?: number;
  audio_end?: number;
  confidence?: number;
  text?: string;
  words?: Array<{
    text: string;
    confidence: number;
    start: number;
    end: number;
  }>;
  message_type?: 'PartialTranscript' | 'FinalTranscript' | 'SessionBegins' | 'SessionTerminated';
  error?: string;
}

export interface AssemblyAIError {
  error: string;
  code?: number;
}
