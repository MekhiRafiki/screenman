"use client"
import { useState } from "react"
import { TranscriptionControls } from "./Recording/TranscriptionControls"
import { RecordButton } from "./Recording/RecordButton"
import Thinker from "./Thinker"
import ConvoDisplay from "./Conversation/ConvoDisplay"
import { TranscriptionLine } from "@/types/transcription"
import { ChevronUp, Wrench, X } from "lucide-react"

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
	const [showConvo, setShowConvo] = useState(true)
	const [showDevTools, setShowDevTools] = useState(false)

	const handleWebsocketUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const url = e.target.value.trim()
		if (!url.startsWith("ws://") && !url.startsWith("wss://")) {
			return
		}
		setWebsocketUrl(url)
	}

	return (
		<div className="flex flex-col h-full">
			{/* Header */}
			<div className="text-center py-4 border-b border-gray-200 relative">
				<h1 className="text-2xl font-bold text-gray-800">ScreenMan</h1>
				<button
					onClick={() => setShowDevTools(true)}
					className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700 transition-colors"
				>
					<Wrench className="w-5 h-5" />
				</button>
			</div>

			{/* Main Content */}
			<div className="flex-1 flex flex-col items-center gap-8 py-6 overflow-y-auto">
				{/* Recording Status */}
				<RecordButton
					isRecording={isRecording}
					onToggle={() => toggleRecording(websocketUrl, chunkDuration)}
				/>

				{/* Thinker */}
				<div className="w-full px-4">
					<Thinker lines={lines} />
				</div>
			</div>

			{/* Conversation Display */}
			<div className="border-t border-gray-200">
				<button
					onClick={() => setShowConvo(!showConvo)}
					className="w-full py-2 flex items-center justify-center gap-2 text-gray-600 hover:bg-gray-50"
				>
					<ChevronUp
						className={`w-4 h-4 transition-transform ${
							showConvo ? "rotate-180" : ""
						}`}
					/>
					{showConvo ? "Hide Conversation" : "Show Conversation"}
				</button>
				<div
					className={`
					transition-all duration-300 overflow-y-scroll
					${showConvo ? "h-96" : "h-0"}
				`}
				>
					<ConvoDisplay />
				</div>
			</div>

			{/* Dev Tools Modal */}
			{showDevTools && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg w-96 shadow-xl">
						<div className="flex items-center justify-between p-4 border-b">
							<h2 className="text-lg font-semibold text-gray-800">
								Developer Settings
							</h2>
							<button
								onClick={() => setShowDevTools(false)}
								className="text-gray-500 hover:text-gray-700"
							>
								<X className="w-5 h-5" />
							</button>
						</div>
						<div className="p-4 space-y-4">
							<div>
								<label className="block text-sm text-gray-600 mb-1">
									Chunk size (ms):
								</label>
								<select
									value={chunkDuration}
									onChange={(e) => setChunkDuration(Number(e.target.value))}
									className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-700"
								>
									{[500, 1000, 2000, 3000, 4000, 5000].map((value) => (
										<option key={value} value={value}>
											{value} ms
										</option>
									))}
								</select>
							</div>

							<div>
								<label className="block text-sm text-gray-600 mb-1">
									WebSocket URL:
								</label>
								<input
									type="text"
									value={websocketUrl}
									onChange={handleWebsocketUrlChange}
									className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-700"
								/>
							</div>
							<TranscriptionControls />
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
