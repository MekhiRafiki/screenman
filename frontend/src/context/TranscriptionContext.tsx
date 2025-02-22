import React, { createContext, useContext, useState } from 'react';

export type TranscriptionMode = 'microphone' | 'file';

interface Topic {
  title: string;
  description: string;
  timestamp?: string;
}

interface TranscriptionContextType {
  // Audiio Intake mode
  mode: TranscriptionMode;
  toggleMode: () => void;
  // Running Conversation Overview
  highLevelSummary: string;
  currentTopic: Topic | null;
  pastTopics: Topic[];
  adjacentTopics: Topic[];
  updateHighLevelSummary: (summary: string) => void;
  updateCurrentTopic: (topic: Topic | null) => void;
  updatePastTopics: (topics: Topic[]) => void;
  updateAdjacentTopics: (topics: Topic[]) => void;
}

const TranscriptionContext = createContext<TranscriptionContextType | undefined>(undefined);

// Initial mock data
const initialConversationState = {
  highLevelSummary: "Today's focus is on improving the speech recognition system and implementing new features.",
  currentTopic: {
    title: "Speech Recognition Enhancement",
    description: "Improving the core speech recognition capabilities",
    timestamp: new Date().toISOString()
  },
  pastTopics: [],
  adjacentTopics: [
    { title: "WebSocket Integration", description: "Real-time data streaming implementation", timestamp: new Date().toISOString() },
    { title: "UI/UX Improvements", description: "Enhanced user interface design", timestamp: new Date().toISOString() },
    { title: "Performance Optimization", description: "System response time improvement", timestamp: new Date().toISOString() }
  ]
};

export const TranscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<TranscriptionMode>('microphone');
  const [highLevelSummary, setHighLevelSummary] = useState<string>(initialConversationState.highLevelSummary);
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(initialConversationState.currentTopic);
  const [pastTopics, setPastTopics] = useState<Topic[]>(initialConversationState.pastTopics);
  const [adjacentTopics, setAdjacentTopics] = useState<Topic[]>(initialConversationState.adjacentTopics);

  const toggleMode = () => {
    setMode(prev => prev === 'microphone' ? 'file' : 'microphone');
  };

  return (
    <TranscriptionContext.Provider value={{
      mode,
      toggleMode,
      highLevelSummary,
      currentTopic,
      pastTopics,
      adjacentTopics,
      updateHighLevelSummary: setHighLevelSummary,
      updateCurrentTopic: setCurrentTopic,
      updatePastTopics: setPastTopics,
      updateAdjacentTopics: setAdjacentTopics,
    }}>
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
