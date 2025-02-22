import { useTranscriptionContext } from '@/context/TranscriptionContext';

export default function ConvoDisplay() {
    const { highLevelSummary, currentTopic, adjacentTopics } = useTranscriptionContext();
        
    return (
        <> 
            <div>
                <h3 className="font-semibold text-gray-800">Conversation Summary</h3>
                <p className="text-sm text-gray-600">{highLevelSummary}</p>
            </div>
            
            {currentTopic && (
                <div>
                    <h3 className="font-semibold text-gray-800">Current Topic</h3>
                    <div className="p-2 bg-gray-50 rounded-md">
                        <h4 className="text-sm font-medium text-gray-800">{currentTopic.title}</h4>
                        <p className="text-xs text-gray-600">{currentTopic.description}</p>
                    </div>
                </div>
            )}

            {adjacentTopics.length > 0 && (
                <div>
                    <h3 className="font-semibold text-gray-800">Related Topics</h3>
                    <div className="space-y-2 mt-2">
                        {adjacentTopics.map((topic, index) => (
                            <div key={index} className="p-2 bg-gray-50 rounded-md">
                                <h4 className="text-sm font-medium text-gray-800">{topic.title}</h4>
                                <p className="text-xs text-gray-600">{topic.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}