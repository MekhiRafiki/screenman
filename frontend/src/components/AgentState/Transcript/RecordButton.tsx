import React from 'react';
import { useTranscriptionContext } from '@/context/TranscriptionContext';

interface RecordButtonProps {
  isRecording: boolean;
  onToggle: () => void;
}

export const RecordButton: React.FC<RecordButtonProps> = ({ isRecording, onToggle }) => {
  const { mode } = useTranscriptionContext();

  if (mode === 'file') {
    return (
      <button
        onClick={onToggle}
        className={`w-16 h-16 text-3xl rounded-full shadow-lg transition-all ${
          isRecording ? 'bg-red-500 text-white' : 'bg-white text-gray-700'
        } hover:scale-105 active:scale-95`}
      >
        ▶️
      </button>
    );
  }

  return (
    <button
      onClick={onToggle}
      className={`w-16 h-16 text-3xl rounded-full shadow-lg transition-all ${
        isRecording ? 'bg-red-500 text-white' : 'bg-white text-gray-700'
      } hover:scale-105 active:scale-95`}
    >
      🎙️
    </button>
  );
};
