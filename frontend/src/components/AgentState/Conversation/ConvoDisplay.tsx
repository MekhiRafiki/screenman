import { useTranscriptionContext } from '@/context/TranscriptionContext';
import { useState } from 'react';

export default function ConvoDisplay() {
    const { highLevelSummary, currentTopic, adjacentTopics, pastTopics } = useTranscriptionContext();
    const [isPastTopicsExpanded, setIsPastTopicsExpanded] = useState(false);
        
    return (
        <> 
            <div>
                <h3 className="font-semibold text-gray-800">Conversation Summary</h3>
                <p className="text-sm text-gray-600">{highLevelSummary}</p>
            </div>
            
            {pastTopics.length > 0 && (
                <div className="my-4">
                    <button 
                        onClick={() => setIsPastTopicsExpanded(!isPastTopicsExpanded)}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
                    >
                        <span className={`transform transition-transform ${isPastTopicsExpanded ? 'rotate-90' : ''}`}>
                            ▶
                        </span>
                        <h3 className="font-semibold">Past Topics ({pastTopics.length})</h3>
                    </button>
                    
                    {isPastTopicsExpanded && (
                        <div className="space-y-2 mt-2 pl-6 border-l-2 border-gray-200">
                            {pastTopics.map((topic, index) => (
                                <div key={index} className="p-2 bg-gray-50 rounded-md">
                                    <h4 className="text-sm font-medium text-gray-800">{topic.title}</h4>
                                    <p className="text-xs text-gray-600">{topic.description}</p>
                                    {topic.timestamp && (
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(topic.timestamp).toLocaleTimeString()}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
            
            {currentTopic && (
                <div>
                    <h3 className="font-semibold text-gray-800">Current Topic</h3>
                    <div className="p-2 bg-gray-50 rounded-md">
                        <h4 className="text-sm font-medium text-gray-800">{currentTopic.title}</h4>
                        <p className="text-xs text-gray-600">{currentTopic.description}</p>
                        {currentTopic.timestamp && (
                            <p className="text-xs text-gray-400 mt-1">
                                {new Date(currentTopic.timestamp).toLocaleTimeString()}
                            </p>
                        )}
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