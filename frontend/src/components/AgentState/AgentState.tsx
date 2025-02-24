"use client"
import { useState } from "react"
import { TranscriptionControls } from "./Transcript/TranscriptionControls"
import { RecordButton } from "./Transcript/RecordButton"
import Thinker from "./Thinker"
import ConvoDisplay from "./Conversation/ConvoDisplay"
import { TranscriptionLine } from "@/types/transcription"

const CHUNK_SIZES = [
	{ value: 500, label: "500 ms" },
	{ value: 1000, label: "1000 ms" },
	{ value: 2000, label: "2000 ms" },
	{ value: 3000, label: "3000 ms" },
	{ value: 4000, label: "4000 ms" },
	{ value: 5000, label: "5000 ms" },
]

export default function AgentState({
	lines,
	toggleRecording,
	isRecording,
}: {
	lines: TranscriptionLine[]
	toggleRecording: (
		websocketUrl?: string,
		chunkDuration?: number
	) => Promise<void>
	isRecording: boolean
}) {
	const [websocketUrl, setWebsocketUrl] = useState("ws://localhost:8000/asr")
	const [chunkDuration, setChunkDuration] = useState(1000)

	const handleWebsocketUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const url = e.target.value.trim()
		if (!url.startsWith("ws://") && !url.startsWith("wss://")) {
			return
		}
		setWebsocketUrl(url)
	}

	return (
		<div className="flex flex-col h-full">
			<div className="flex items-center gap-4 mb-6">
				<div className="flex flex-col items-center gap-2">
					<TranscriptionControls />
					<RecordButton
						isRecording={isRecording}
						onToggle={() => toggleRecording(websocketUrl, chunkDuration)}
					/>
				</div>

				<div className="space-y-3">
					<div>
						<label
							htmlFor="chunkSelector"
							className="block text-sm text-gray-600 mb-1"
						>
							Chunk size (ms):
						</label>
						<select
							id="chunkSelector"
							value={chunkDuration}
							onChange={(e) => setChunkDuration(Number(e.target.value))}
							className="px-2 py-1 border rounded-md bg-gray-50 text-gray-700 text-sm"
						>
							{CHUNK_SIZES.map(({ value, label }) => (
								<option key={value} value={value}>
									{label}
								</option>
							))}
						</select>
					</div>

					<div>
						<label
							htmlFor="websocketInput"
							className="block text-sm text-gray-600 mb-1"
						>
							WebSocket URL:
						</label>
						<input
							id="websocketInput"
							type="text"
							value={websocketUrl}
							onChange={handleWebsocketUrlChange}
							className="w-48 px-2 py-1 border rounded-md bg-gray-50 text-gray-700 text-sm"
						/>
					</div>
				</div>
			</div>
			<Thinker lines={lines} />

			<div className="flex-1 overflow-y-auto mb-4 relative">
				<div
					className={
						"absolute inset-0 overflow-y-auto transition-opacity duration-200 opacity-100"
					}
				>
					<ConvoDisplay />
				</div>
			</div>
		</div>
	)
}
