"use client"
import { useTranscriptionContext } from "@/context/TranscriptionContext"
import { CircleCheck } from "lucide-react"
import UrlPreview from "./UrlPreview"

export default function Stage() {
	const { stageProposals, updateStageProposals } = useTranscriptionContext()

	const handleNextProposal = () => {
		if (stageProposals.length > 0) {
			updateStageProposals(stageProposals.slice(1))
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
		stageProposals.length > 0 ? stageProposals[0].text : "Following along..."
	const textSize = getTextSize(currentText)

	return (
		<div className="flex flex-col gap-6 w-full h-full justify-center items-center">
			<div className="bg-white/10 backdrop-blur-sm p-8 rounded-lg shadow-lg">
				<p
					className={`${textSize} font-bold text-white text-center leading-relaxed mb-8 transition-all duration-300`}
				>
					{currentText}
				</p>

				{stageProposals.length > 0 && stageProposals[0].webUrls && (
					<div className="flex flex-wrap gap-4 justify-center mt-4">
						{stageProposals[0].webUrls.map((url, index) => (
							<UrlPreview key={index} url={url} index={index} />
						))}
					</div>
				)}
			</div>

			{stageProposals.length > 0 && (
				<button
					onClick={handleNextProposal}
					className="mx-auto flex items-center gap-2 bg-green-500/20 hover:bg-green-500/30 transition-colors text-white px-6 py-3 rounded-full"
				>
					<CircleCheck className="w-6 h-6" />
					<span>Next</span>
				</button>
			)}
		</div>
	)
}
