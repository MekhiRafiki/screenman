import { useTranscriptionContext } from "@/context/TranscriptionContext"
import { useState } from "react"
import { Sparkles, History, Target, Network } from "lucide-react"

export default function ConvoDisplay() {
	const { highLevelSummary, currentTopic, adjacentTopics, pastTopics } =
		useTranscriptionContext()
	const [isPastTopicsExpanded, setIsPastTopicsExpanded] = useState(false)

	return (
		<div className="space-y-6 h-fit">
			<div>
				<div className="flex items-center gap-2 mb-2">
					<Sparkles className="w-4 h-4 text-gray-600" />
					<h3 className="font-semibold text-gray-800">Conversation Summary</h3>
				</div>
				{highLevelSummary ? (
					<p className="text-sm text-gray-600">{highLevelSummary}</p>
				) : (
					<p className="text-sm text-gray-400 italic">
						Waiting for conversation to begin...
					</p>
				)}
			</div>

			<div>
				<div className="flex items-center gap-2 mb-2">
					<History className="w-4 h-4 text-gray-600" />
					<h3 className="font-semibold text-gray-800">Past Topics</h3>
				</div>
				{pastTopics.length > 0 ? (
					<div className="space-y-2">
						<button
							onClick={() => setIsPastTopicsExpanded(!isPastTopicsExpanded)}
							className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
						>
							<span
								className={`transform transition-transform ${
									isPastTopicsExpanded ? "rotate-90" : ""
								}`}
							>
								▶
							</span>
							<span className="text-sm">Show {pastTopics.length} topics</span>
						</button>

						{isPastTopicsExpanded && (
							<div className="space-y-2 pl-6 border-l-2 border-gray-200">
								{pastTopics.map((topic, index) => (
									<div key={index} className="p-2 bg-gray-50 rounded-md">
										<h4 className="text-sm font-medium text-gray-800">
											{topic.title}
										</h4>
										<p className="text-xs text-gray-600">{topic.description}</p>
									</div>
								))}
							</div>
						)}
					</div>
				) : (
					<p className="text-sm text-gray-400 italic">No previous topics yet</p>
				)}
			</div>

			<div>
				<div className="flex items-center gap-2 mb-2">
					<Target className="w-4 h-4 text-gray-600" />
					<h3 className="font-semibold text-gray-800">Current Topic</h3>
				</div>
				{currentTopic ? (
					<div className="p-2 bg-gray-50 rounded-md">
						<h4 className="text-sm font-medium text-gray-800">
							{currentTopic.title}
						</h4>
						<p className="text-xs text-gray-600">{currentTopic.description}</p>
					</div>
				) : (
					<p className="text-sm text-gray-400 italic">No active topic</p>
				)}
			</div>

			<div>
				<div className="flex items-center gap-2 mb-2">
					<Network className="w-4 h-4 text-gray-600" />
					<h3 className="font-semibold text-gray-800">Related Topics</h3>
				</div>
				{adjacentTopics.length > 0 ? (
					<div className="space-y-2">
						{adjacentTopics.map((topic, index) => (
							<div key={index} className="p-2 bg-gray-50 rounded-md">
								<h4 className="text-sm font-medium text-gray-800">
									{topic.title}
								</h4>
								<p className="text-xs text-gray-600">{topic.description}</p>
							</div>
						))}
					</div>
				) : (
					<p className="text-sm text-gray-400 italic">
						No related topics found
					</p>
				)}
			</div>
		</div>
	)
}
