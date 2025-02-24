"use client"
import AgentState from "@/components/AgentState/AgentState"
import Transcript from "@/components/Transcript"
import Stage from "@/components/Stage"
import Related from "@/components/Related" // Added import statement for Related component
import { TranscriptionProvider } from "@/context/TranscriptionContext"
import { useState } from "react"
import ButtonGroup from "@/components/ui/ButtonGroup"
import { useTranscription } from "@/hooks/useTranscription"

export type View = "Stage" | "Transcript" | "Related"
function HomeContent() {
	const [activeView, setActiveView] = useState<View>("Stage")
	const { lines, buffer, toggleRecording, isRecording } = useTranscription()

	return (
		<div className="flex h-screen flex-row">
			{/* Left sidebar with AgentState */}
			<div className="w-1/3 max-w-md border-r border-gray-200 p-4 bg-white overflow-y-auto">
				<AgentState
					lines={lines}
					toggleRecording={toggleRecording}
					isRecording={isRecording}
				/>
			</div>

			<div className="flex-1 bg-[#060CE9] flex flex-col justify-start p-8">
				<div className="flex flex-row items-center justify-center mb-4">
					<ButtonGroup
						value={activeView}
						onChange={(value) => setActiveView(value as View)}
						options={["Stage", "Transcript", "Related"]}
					/>
				</div>
				{(() => {
					switch (activeView) {
						case "Stage":
							return <Stage />
						case "Transcript":
							return <Transcript lines={lines} buffer={buffer} />
						case "Related":
							return <Related />
						default:
							return null
					}
				})()}
			</div>
		</div>
	)
}

export default function Home() {
	return (
		<TranscriptionProvider>
			<HomeContent />
		</TranscriptionProvider>
	)
}
