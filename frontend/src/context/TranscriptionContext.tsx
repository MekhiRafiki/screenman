import { ResearchStageProposals, Topic } from '@/types/research';
import React, { createContext, useContext, useState } from 'react';

export type TranscriptionMode = 'microphone' | 'file';

interface TranscriptionContextType {
  // Audiio Intake mode
  mode: TranscriptionMode;
  toggleMode: () => void;
  // Running Conversation Overview
  highLevelSummary: string;
  currentTopic: Topic | null;
  pastTopics: Topic[];
  adjacentTopics: Topic[];
  stageProposals: ResearchStageProposals[];
  updateHighLevelSummary: (summary: string) => void;
  updateCurrentTopic: (topic: Topic | null) => void;
  updatePastTopics: (topics: Topic[]) => void;
  updateAdjacentTopics: (topics: Topic[]) => void;
  updateStageProposals: (proposals: ResearchStageProposals[]) => void;
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
    {
        "title": "Impact of Diversity on Reality TV Show Dynamics",
        "description": "Exploring how the level of diversity within reality TV show casts affects the dynamics, conversations, and viewer engagement. This topic naturally flows from the discussion on the Minneapolis season's lack of drama and diversity, offering a broader perspective on the importance of diverse representation in media."
    },
    {
        "title": "Evolution of Reality TV Show Formats",
        "description": "Analyzing how reality TV show formats have evolved over time, including changes in casting, storytelling, and audience interaction. This topic is relevant given the criticism of the Minneapolis season for lacking drama, suggesting a potential need for innovation in how reality TV shows are produced and presented."
    }
  ],
  stageProposals: [
    {
        "text": "The Minneapolis season of Love Is Blind has been criticized for being the most boring yet, with fans disappointed by the lack of exciting personalities and dramatic storylines. This sentiment is echoed across multiple reviews, highlighting a general consensus on the season's lack of drama compared to previous iterations of the show. Additionally, there were complaints about the lack of diversity among the cast, which could have contributed to the perceived lack of engaging content. Despite the largest ever group of participants at 32, only a few people of color received significant screen time, potentially impacting the depth and variety of conversations and storylines.",
        "claims": [
            "Minneapolis Season's Lack of Drama",
            "Discussion about how the Minneapolis cohort seems less engaging compared to previous seasons"
        ],
        "webUrls": [
            "https://www.pinkvilla.com/entertainment/hollywood/love-is-blind-season-8-minneapolis-fan-review-viewers-call-latest-edition-so-boring-top-reactions-here-1373120",
            "https://www.mprnews.org/story/2025/02/21/love-is-bland-minnesotans-react-love-is-blind-minneapolis-season-debut-diversity",
            "https://www.axios.com/local/twin-cities/2025/02/19/love-is-blind-season-eight-minneapolis-boring"
        ]
    },
    {
        "text": "Minneapolis Season's Lack of Drama",
        "claims": [
            "Love is Blind has launched multiple new seasons across different cities, with varying levels of success and drama. The show continues to experiment with different locations and casting choices, though some seasons have proven more engaging than others.",
            "Discussion about how the Minneapolis cohort seems less engaging compared to previous seasons"
        ]
    }
],
};

export const TranscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<TranscriptionMode>('microphone')
  const [highLevelSummary, setHighLevelSummary] = useState<string>("") // initialConversationState.highLevelSummary
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(null) //initialConversationState.currentTopic
  const [pastTopics, setPastTopics] = useState<Topic[]>([]) //initialConversationState.pastTopics
  const [adjacentTopics, setAdjacentTopics] = useState<Topic[]>([]) // initialConversationState.adjacentTopics
  const [stageProposals, setStageProposals] = useState<ResearchStageProposals[]>([]) // initialConversationState.stageProposals

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
      stageProposals,
      updateHighLevelSummary: setHighLevelSummary,
      updateCurrentTopic: setCurrentTopic,
      updatePastTopics: setPastTopics,
      updateAdjacentTopics: setAdjacentTopics,
      updateStageProposals: setStageProposals
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
