import { useTranscriptionContext } from "@/context/TranscriptionContext"
import { Network } from "lucide-react"

export default function Related() {
	const { adjacentTopics } = useTranscriptionContext()
	return (
		<div className="p-8 max-w-4xl mx-auto">
			<div className="flex items-center gap-4 mb-8">
				<Network className="w-8 h-8 text-white" />
				<h3 className="font-bold text-white text-4xl">Related Topics</h3>
			</div>
			{adjacentTopics.length > 0 ? (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{adjacentTopics.map((topic, index) => (
						<div 
							key={index} 
							className="p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all duration-300"
						>
							<h4 className="text-xl font-semibold text-white mb-3">{topic.title}</h4>
							<p className="text-base text-white/70 leading-relaxed">{topic.description}</p>
						</div>
					))}
				</div>
			) : (
				<div className="flex flex-col items-center justify-center py-16">
					<p className="text-xl text-white/50 italic text-center">
						No related topics found yet
					</p>
					<p className="text-base text-white/30 mt-2">
						Topics will appear as the conversation progresses
					</p>
				</div>
			)}
		</div>
	)
}
