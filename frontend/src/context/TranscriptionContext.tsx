import { ResearchStageProposals, Topic } from "@/types/research"
import React, { createContext, useContext, useState } from "react"

export type TranscriptionMode = "microphone" | "file"

export interface TranscriptOption {
	path: string
	displayName: string
}

export const TRANSCRIPT_OPTIONS: TranscriptOption[] = [
	{
		path: "/data/jbp_allstar.txt",
		displayName: "Joe Budden Podcast - All Star Game Recap",
	},
	{
		path: "/data/jbp_eagles.txt",
		displayName: "Joe Budden Podcast - 2025 Super Bowl Recap",
	},
]

interface TranscriptionContextType {
	// Audio Intake mode
	mode: TranscriptionMode
	transcriptOption: TranscriptOption
	setTranscriptOption: (option: TranscriptOption) => void
	toggleMode: () => void
	// Running Conversation Overview
	highLevelSummary: string
	currentTopic: Topic | null
	pastTopics: Topic[]
	adjacentTopics: Topic[]
	stageProposals: ResearchStageProposals[]
	updateHighLevelSummary: (summary: string) => void
	updateCurrentTopic: (topic: Topic | null) => void
	updatePastTopics: (topics: Topic[]) => void
	updateAdjacentTopics: (topics: Topic[]) => void
	updateStageProposals: (proposals: ResearchStageProposals[]) => void
}

const TranscriptionContext = createContext<
	TranscriptionContextType | undefined
>(undefined)

export const TranscriptionProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [mode, setMode] = useState<TranscriptionMode>("microphone")
	const [transcriptOption, setTranscriptOption] = useState<TranscriptOption>(
		TRANSCRIPT_OPTIONS[0]
	)
	const [highLevelSummary, setHighLevelSummary] = useState<string>("") // initialConversationState.highLevelSummary
	const [currentTopic, setCurrentTopic] = useState<Topic | null>(null) // initialConversationState.currentTopic
	const [pastTopics, setPastTopics] = useState<Topic[]>([]) // initialConversationState.pastTopics
	const [adjacentTopics, setAdjacentTopics] = useState<Topic[]>([]) // initialConversationState.adjacentTopics
	const [stageProposals, setStageProposals] = useState<
		ResearchStageProposals[]
	>([]) // initialConversationState.stageProposals

	const toggleMode = () => {
		setMode((prev) => (prev === "microphone" ? "file" : "microphone"))
	}

	return (
		<TranscriptionContext.Provider
			value={{
				mode,
				transcriptOption,
				setTranscriptOption,
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
				updateStageProposals: setStageProposals,
			}}
		>
			{children}
		</TranscriptionContext.Provider>
	)
}

export const useTranscriptionContext = () => {
	const context = useContext(TranscriptionContext)
	if (context === undefined) {
		throw new Error(
			"useTranscriptionContext must be used within a TranscriptionProvider"
		)
	}
	return context
}
