"use client"
import { TranscriptionLine } from "@/types/transcription"
import { useRef, useState, useEffect } from "react"
import { useScheduledProcess } from "@/hooks/useScheduledProcess"
import { useTranscriptionContext } from "@/context/TranscriptionContext"
import { DiscernResponse, ResearchResponse, Topic } from "@/types/research"
import { Brain, Ear, MonitorDot } from "lucide-react"
import { usePostHog } from "posthog-js/react"

type ThinkingState = "listening" | "thinking" | "researching"

export default function Thinker({ lines }: { lines: TranscriptionLine[] }) {
	const posthog = usePostHog()
	const [currentState, setCurrentState] = useState<ThinkingState>("listening")
	const lastProcessedIndex = useRef<number>(0)
	const linesRef = useRef<TranscriptionLine[]>(lines)
	const {
		highLevelSummary,
		currentTopic,
		pastTopics,
		stageProposals,
		updateHighLevelSummary,
		updateCurrentTopic,
		updatePastTopics,
		updateAdjacentTopics,
		updateStageProposals,
	} = useTranscriptionContext()

	/**
	 * Updates the high level summary with a sumamrization of the new and past topics
	 * @param newCurrentTopic
	 */
	const updateSummary = async (newCurrentTopic: Topic) => {
		const newSummary = await fetch("/api/summarize", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				summary: highLevelSummary,
				pastTopics: pastTopics,
				currentTopic: newCurrentTopic,
			}),
		})
		posthog.capture("summary_executed")
		if (newSummary) {
			const newSummaryData = await newSummary.json()
			updateHighLevelSummary(newSummaryData)
			posthog.capture("new_summary")
		}
	}

	const handleDiscernData = (discernData: DiscernResponse) => {
		if (discernData.newCurrentTopic) {
			updatePastTopics(pastTopics.concat(discernData.newCurrentTopic))
			updateCurrentTopic(discernData.newCurrentTopic)
			posthog.capture("new_topic_change_detected")
			updateSummary(discernData.newCurrentTopic)
		}
	}

	const handleResearchData = (researchData: ResearchResponse) => {
		if (researchData.newAdjacentTopics) {
			updateAdjacentTopics(researchData.newAdjacentTopics)
		}
		if (researchData.newStageProposals) {
			updateStageProposals(
				stageProposals.concat(researchData.newStageProposals)
			)
		}
	}

	const processStates = async () => {
		// Check if we have enough new lines to process
		const currentLines = linesRef.current
		const newLinesCount = currentLines.length - lastProcessedIndex.current

		console.log("Processing state check:", {
			totalLines: currentLines.length,
			lastProcessedIndex: lastProcessedIndex.current,
			newLinesCount,
			currentLines,
		})

		if (newLinesCount < 10) {
			setCurrentState("listening")
			console.log("Waiting for more lines...", {
				current: lastProcessedIndex.current,
				total: currentLines.length,
				new: newLinesCount,
			})
			return false // Not enough lines, check again soon
		}

		try {
			// We have enough new lines, start processing
			setCurrentState("thinking")
			const newLines = currentLines.slice(lastProcessedIndex.current)
			console.log("Making discern API call", {
				processingLines: newLines,
				startIndex: lastProcessedIndex.current,
				endIndex: currentLines.length,
			})

			const discernResponse = await fetch("/api/discern", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					highLevelSummary,
					currentTopic,
					newLines,
				}),
			})
			const discernData: DiscernResponse = await discernResponse.json()
			if (!discernData.newCurrentTopic && !discernData.claims) {
				console.log("No New information retrieved during discernment")
				return false
			}
			posthog.capture("discernment_executed", {
				newClaims: discernData.claims?.length || 0,
			})
			handleDiscernData(discernData)

			// Start research phase
			setCurrentState("researching")
			console.log("Making research API call")
			const researchResponse = await fetch("/api/research", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					currentTopic,
					claims: discernData.claims,
				}),
			})
			const researchData = await researchResponse.json()
			posthog.capture("research_executed", {
				newAdjacentTopics: researchData.newAdjacentTopics?.length || 0,
				newStageProposals: researchData.newStageProposals?.length || 0,
			})
			handleResearchData(researchData)

			// Update the last processed index only after successful processing
			const previousIndex = lastProcessedIndex.current
			lastProcessedIndex.current = currentLines.length
			console.log("Updated processing index", {
				previous: previousIndex,
				new: lastProcessedIndex.current,
			})

			// Back to listening
			setCurrentState("listening")
			return true // Successfully processed, wait full interval
		} catch (error) {
			console.error("Error in processing states:", error)
			setCurrentState("listening")
			return false // Error occurred, check again soon
		}
	}

	// Schedule the process to run every 8 seconds
	useScheduledProcess(processStates, 8000)

	const getStateLabel = (state: ThinkingState) => {
		switch (state) {
			case "listening":
				return "Listening..."
			case "thinking":
				return "Thinking..."
			case "researching":
				return "Researching..."
		}
	}

	// Keep linesRef up to date
	useEffect(() => {
		linesRef.current = lines
	}, [lines])

	// Update lastProcessedIndex when lines array changes
	useEffect(() => {
		if (lines.length === 0) {
			lastProcessedIndex.current = 0
		}
	}, [lines])

	return (
		<div className="flex flex-col items-center justify-center gap-4">
			<div className="relative w-32 h-32">
				{/* Outer glow */}
				<div className="absolute inset-0 rounded-full bg-white/20 blur-xl" />

				{/* Gradient background with animation */}
				<div
					className="absolute inset-0 rounded-full animate-gradient-rotate"
					style={{
						background: "linear-gradient(-45deg, #60a5fa, #8b5cf6, #db2777)",
						backgroundSize: "200% 200%",
					}}
				/>

				{/* Inner white circle with icon */}
				<div className="absolute inset-2 bg-white rounded-full shadow-inner flex items-center justify-center">
					<div
						className={`
						transition-opacity duration-300 text-gray-700
						${currentState === "listening" ? "opacity-100" : "opacity-0"}
					`}
					>
						<Ear className="w-12 h-12" />
					</div>
					<div
						className={`
						absolute inset-0 flex items-center justify-center
						transition-opacity duration-300
						${currentState === "thinking" ? "opacity-100" : "opacity-0"}
					`}
					>
						<Brain className="w-12 h-12" />
					</div>
					<div
						className={`
						absolute inset-0 flex items-center justify-center
						transition-opacity duration-300
						${currentState === "researching" ? "opacity-100" : "opacity-0"}
					`}
					>
						<MonitorDot className="w-12 h-12" />
					</div>
				</div>
			</div>

			<div className="text-lg font-medium text-gray-600">
				{getStateLabel(currentState)}
			</div>
		</div>
	)
}
