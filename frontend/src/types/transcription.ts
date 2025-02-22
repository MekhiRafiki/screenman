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
