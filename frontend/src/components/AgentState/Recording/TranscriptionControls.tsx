import React from "react"
import { useTranscriptionContext } from "@/context/TranscriptionContext"

export const TranscriptionControls: React.FC = () => {
	const { mode, toggleMode } = useTranscriptionContext()

	return (
		<div
			className="inline-flex rounded-md shadow-sm justify-center w-full"
			role="group"
		>
			<button
				onClick={() => mode !== "microphone" && toggleMode()}
				className={`px-4 py-2 text-sm font-medium rounded-l-lg border ${
					mode === "microphone"
						? "bg-blue-500 text-white border-blue-500"
						: "bg-white text-gray-900 border-gray-200 hover:bg-gray-100"
				}`}
				title="Switch to microphone mode"
			>
				Audio
			</button>
			<button
				onClick={() => mode !== "file" && toggleMode()}
				className={`px-4 py-2 text-sm font-medium rounded-r-lg border-t border-b border-r ${
					mode === "file"
						? "bg-blue-500 text-white border-blue-500"
						: "bg-white text-gray-900 border-gray-200 hover:bg-gray-100"
				}`}
				title="Switch to transcript mode"
			>
				Transcript
			</button>
		</div>
	)
}
