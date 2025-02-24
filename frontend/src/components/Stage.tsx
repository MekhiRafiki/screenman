"use client"
import { useTranscriptionContext } from "@/context/TranscriptionContext"
import {
	Check,
	ChevronRight,
	ChevronLeft,
	Volume2,
	Loader2,
	Pause,
} from "lucide-react"
import { useState, useRef } from "react"
import UrlPreview from "./UrlPreview"
import { ResearchStageProposals } from "@/types/research"

export default function Stage() {
	const { stageProposals, updateStageProposals } = useTranscriptionContext()
	const [currentIndex, setCurrentIndex] = useState(0)
	const [isGeneratingAudio, setIsGeneratingAudio] = useState(false)
	const [isPlaying, setIsPlaying] = useState(false)
	// TODO(mj): Display the completed proposals later
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [completedProposals, setCompletedProposals] = useState<
		ResearchStageProposals[]
	>([])
	const audioRef = useRef<HTMLAudioElement | null>(null)

	const handlePrevProposal = () => {
		if (stageProposals.length > 0) {
			setCurrentIndex(
				(prev) => (prev - 1 + stageProposals.length) % stageProposals.length
			)
		}
	}

	const handleNextProposal = () => {
		if (stageProposals.length > 0) {
			setCurrentIndex((prev) => (prev + 1) % stageProposals.length)
		}
	}

	const handleRemoveProposal = () => {
		if (stageProposals.length > 0) {
			const removedProposal = stageProposals[currentIndex]
			const newProposals = stageProposals.filter((_, i) => i !== currentIndex)
			updateStageProposals(newProposals)
			setCurrentIndex(Math.min(currentIndex, newProposals.length - 1))
			setCompletedProposals((prev) => [...prev, removedProposal])
		}
	}

	const getTextSize = (text: string) => {
		if (!text) return "text-4xl"
		if (text.length < 100) return "text-4xl"
		if (text.length < 200) return "text-3xl"
		if (text.length < 300) return "text-2xl"
		return "text-xl"
	}

	const currentText =
		stageProposals.length > 0
			? stageProposals[currentIndex].text
			: "Following along..."
	const textSize = getTextSize(currentText)

	const togglePlayPause = () => {
		if (audioRef.current) {
			if (isPlaying) {
				audioRef.current.pause()
			} else {
				audioRef.current.play()
			}
			setIsPlaying(!isPlaying)
		}
	}

	const readText = async () => {
		try {
			setIsGeneratingAudio(true)
			const response = await fetch(
				"https://api.elevenlabs.io/v1/text-to-speech/JBFqnCBsd6RMkjVDRZzb",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"xi-api-key": process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || "",
					},
					body: JSON.stringify({
						text: currentText,
						model_id: "eleven_flash_v2_5",
						voice_settings: {
							stability: 0.5,
							similarity_boost: 0.75,
						},
					}),
				}
			)

			if (!response.ok) {
				throw new Error("Failed to generate speech")
			}

			const audioBlob = await response.blob()
			const url = URL.createObjectURL(audioBlob)

			// Create and play audio
			if (audioRef.current) {
				audioRef.current.src = url
			} else {
				audioRef.current = new Audio(url)
			}

			audioRef.current.onended = () => {
				URL.revokeObjectURL(url)
				setIsPlaying(false)
			}

			await audioRef.current.play()
			setIsPlaying(true)
		} catch (error) {
			console.error("Error playing audio:", error)
		} finally {
			setIsGeneratingAudio(false)
		}
	}

	return (
		<div className="flex flex-col gap-6 w-full h-full justify-center items-center">
			<div className="bg-white/10 backdrop-blur-sm p-8 rounded-lg shadow-lg relative">
				<p
					className={`${textSize} font-bold text-white text-center leading-relaxed mb-8 transition-all duration-300`}
				>
					{currentText}
				</p>

				{stageProposals.length > 0 && stageProposals[currentIndex].webUrls && (
					<div className="flex flex-wrap gap-4 justify-center mt-4">
						{stageProposals[currentIndex].webUrls.map((url, index) => (
							<UrlPreview key={index} url={url} index={index} />
						))}
					</div>
				)}

				{stageProposals.length > 0 && (
					<div className="mt-6 text-center flex flex-col gap-4">
						<span className="text-white/70 text-sm font-medium">
							Proposal {currentIndex + 1} of {stageProposals.length}
						</span>
						<div className="flex items-center justify-center gap-3">
							<button
								onClick={handlePrevProposal}
								className="bg-white/10 hover:bg-white/20 transition-colors text-white p-2 rounded-lg"
								title="Previous proposal"
							>
								<ChevronLeft className="w-5 h-5" />
							</button>
							<button
								onClick={handleNextProposal}
								className="bg-white/10 hover:bg-white/20 transition-colors text-white p-2 rounded-lg"
								title="Next proposal"
							>
								<ChevronRight className="w-5 h-5" />
							</button>
						</div>
					</div>
				)}

				{stageProposals.length > 0 && (
					<button
						onClick={
							isGeneratingAudio
								? undefined
								: isPlaying
								? togglePlayPause
								: readText
						}
						disabled={isGeneratingAudio}
						className={`absolute -bottom-3 -right-3 bg-[#7B7EF4] text-white rounded-full shadow-lg transition-all duration-300 p-3
							${isGeneratingAudio ? "opacity-75" : "hover:bg-[#8B8EFF]"}
						`}
						title={
							isGeneratingAudio
								? "Generating audio..."
								: isPlaying
								? "Pause"
								: "Read text"
						}
					>
						{isGeneratingAudio ? (
							<Loader2 className="w-5 h-5 animate-spin" />
						) : isPlaying ? (
							<Pause className="w-5 h-5" />
						) : (
							<Volume2 className="w-5 h-5" />
						)}
					</button>
				)}
			</div>

			{stageProposals.length > 0 && (
				<div className="flex items-center gap-4">
					<button
						onClick={handleRemoveProposal}
						className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 transition-colors text-white px-6 py-3 rounded-lg"
					>
						<Check className="w-5 h-5" />
					</button>
				</div>
			)}
		</div>
	)
}
