"use client"
import { TranscriptionLine } from "@/types/transcription"
import { useRef } from "react"

export default function Transcript({
	lines,
	buffer,
}: {
	lines: TranscriptionLine[]
	buffer: string
}) {
	const transcriptRef = useRef<HTMLDivElement>(null)

	const renderTranscriptionLine = (item: TranscriptionLine, idx: number) => {
		const timeInfo = item.beg && item.end ? ` ${item.beg} - ${item.end}` : ""
		let speakerLabel

		switch (item.speaker) {
			case -2:
				speakerLabel = (
					<span className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded-full">
						Silence<span className="ml-2 text-gray-500">{timeInfo}</span>
					</span>
				)
				break
			case -1:
				speakerLabel = (
					<span className="px-3 py-1 text-sm text-blue-600 bg-blue-50 rounded-full flex items-center">
						<div className="w-2 h-2 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
						<span>
							{item.diff} second(s) of audio are undergoing diarization
						</span>
					</span>
				)
				break
			case -3:
				speakerLabel = (
					<span className="px-3 py-1 text-sm text-gray-600 bg-blue-50 rounded-full">
						<span className="text-gray-500">{timeInfo}</span>
					</span>
				)
				break
			default:
				speakerLabel = (
					<span className="px-3 py-1 text-sm text-blue-600 bg-blue-50 rounded-full">
						Speaker {item.speaker}
						<span className="ml-2 text-gray-500">{timeInfo}</span>
					</span>
				)
		}

		const textContent =
			item.text +
			(idx === lines.length - 1 && buffer ? (
				<span className="italic text-gray-400 ml-1">{buffer}</span>
			) : (
				""
			))

		return (
			<div key={idx} className="mb-4">
				{speakerLabel}
				<div className="mt-2 pl-4 border-l-2 border-blue-50 text-base-content">
					{textContent}
				</div>
			</div>
		)
	}

	return (
		<div
			ref={transcriptRef}
			className={`h-full overflow-y-scroll transition-opacity duration-200`}
		>
			<p className="text-sm text-gray-600 mb-4">{status}</p>
			{lines.map((line, idx) => renderTranscriptionLine(line, idx))}
		</div>
	)
}
