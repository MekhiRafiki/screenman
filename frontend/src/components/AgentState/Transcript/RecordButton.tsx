import React from "react"

interface RecordButtonProps {
	isRecording: boolean
	onToggle: () => void
}

export const RecordButton: React.FC<RecordButtonProps> = ({
	isRecording,
	onToggle,
}) => {
	return (
		<div className="flex flex-col items-center gap-2">
			<button
				onClick={() => onToggle()}
				className={`
							px-6 py-2 rounded-full font-semibold transition-all duration-300
							${
								isRecording
									? "bg-red-500 text-white hover:bg-red-600"
									: "bg-gray-200 text-gray-700 hover:bg-gray-300"
							}
						`}
			>
				LIVE
			</button>
			<div className="text-xs text-gray-500">
				{isRecording ? "Recording..." : "Click to start"}
			</div>
		</div>
	)
}
