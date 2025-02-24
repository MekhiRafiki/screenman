import React from "react"
import { TRANSCRIPT_OPTIONS, useTranscriptionContext } from "@/context/TranscriptionContext"
import { ChevronDown } from "lucide-react"

export const TranscriptionControls: React.FC = () => {
	const { mode, toggleMode, transcriptOption, setTranscriptOption } = useTranscriptionContext()

	return (
		<div className="flex flex-col gap-3 items-center w-full">
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
			
			{mode === "file" && (
				<div className="relative w-full">
					<select
						value={transcriptOption.path}
						onChange={(e) => {
							const option = TRANSCRIPT_OPTIONS.find(opt => opt.path === e.target.value)
							if (option) setTranscriptOption(option)
						}}
						className="w-full px-4 py-2 text-sm font-medium bg-white text-gray-900 border border-gray-200 rounded-lg appearance-none cursor-pointer"
					>
						{TRANSCRIPT_OPTIONS.map((option) => (
							<option key={option.path} value={option.path}>
								{option.displayName}
							</option>
						))}
					</select>
					<div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
						<ChevronDown className="w-4 h-4 text-gray-400" />
					</div>
				</div>
			)}
		</div>
	)
}
