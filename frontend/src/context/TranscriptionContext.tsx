import React, { createContext, useContext, useState } from 'react';

export type TranscriptionMode = 'microphone' | 'file';

interface TranscriptionContextType {
  mode: TranscriptionMode;
  toggleMode: () => void;
}

const TranscriptionContext = createContext<TranscriptionContextType | undefined>(undefined);

export const TranscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<TranscriptionMode>('microphone');

  const toggleMode = () => {
    setMode(prev => prev === 'microphone' ? 'file' : 'microphone');
  };

  return (
    <TranscriptionContext.Provider value={{ mode, toggleMode }}>
      {children}
    </TranscriptionContext.Provider>
  );
};

export const useTranscriptionContext = () => {
  const context = useContext(TranscriptionContext);
  if (context === undefined) {
    throw new Error('useTranscriptionContext must be used within a TranscriptionProvider');
  }
  return context;
};
