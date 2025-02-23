"use client"
import { TranscriptionLine } from '@/types/transcription';
import { useRef, useState, useEffect } from 'react';
import { useScheduledProcess } from '@/hooks/useScheduledProcess';
import { useTranscriptionContext } from '@/context/TranscriptionContext';
import { DiscernResponse, ResearchResponse } from '@/types/research';

type ThinkingState = 'listening' | 'thinking' | 'researching';

export default function Thinker({lines}: {lines: TranscriptionLine[]}) {
    const [currentState, setCurrentState] = useState<ThinkingState>('listening');
    const lastProcessedIndex = useRef<number>(0);
    const linesRef = useRef<TranscriptionLine[]>(lines);
    const { 
        highLevelSummary, 
        currentTopic, 
        pastTopics, 
        stageProposals,
        updateHighLevelSummary, 
        updateCurrentTopic, 
        updatePastTopics, 
        updateAdjacentTopics,
        updateStageProposals } = useTranscriptionContext();

    const handleDiscernData = (discernData: DiscernResponse) => {
        if (discernData.newCurrentTopic) {
            updatePastTopics(pastTopics.concat(discernData.newCurrentTopic));
            updateCurrentTopic(discernData.newCurrentTopic);
        }
    }

    const handleResearchData = (researchData: ResearchResponse) => {
        if (researchData.newAdjacentTopics){
            updateAdjacentTopics(researchData.newAdjacentTopics);
        }
        if (researchData.newStageProposals){
            updateStageProposals(stageProposals.concat(researchData.newStageProposals));
        }
    }

    const processStates = async () => {
        // Check if we have enough new lines to process
        const currentLines = linesRef.current;
        const newLinesCount = currentLines.length - lastProcessedIndex.current;
        
        console.log('Processing state check:', {
            totalLines: currentLines.length,
            lastProcessedIndex: lastProcessedIndex.current,
            newLinesCount,
            currentLines
        });

        if (newLinesCount < 3) {
            setCurrentState('listening');
            console.log('Waiting for more lines...', {
                current: lastProcessedIndex.current,
                total: currentLines.length,
                new: newLinesCount
            });
            return false; // Not enough lines, check again soon
        }

        try {
            // We have enough new lines, start processing
            setCurrentState('thinking');
            const newLines = currentLines.slice(lastProcessedIndex.current);
            console.log('Making discern API call', {
                processingLines: newLines,
                startIndex: lastProcessedIndex.current,
                endIndex: currentLines.length
            });
            
            const discernResponse = await fetch('/api/discern', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    highLevelSummary,
                    currentTopic,
                    newLines
                }),
            });
            const discernData: DiscernResponse = await discernResponse.json();
            console.log('Discern response:', discernData);
            if (!discernData.newCurrentTopic && !discernData.claims) {
                console.log('No New information retrieved during discernment');
                return false;
            }
            handleDiscernData(discernData);

            // Start research phase
            setCurrentState('researching');
            console.log('Making research API call');
            const researchResponse = await fetch('/api/research', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    currentTopic,
                    claims: discernData.claims
                }),
            });
            const researchData = await researchResponse.json();
            console.log('Research response:', researchData);
            handleResearchData(researchData);

            // Update the last processed index only after successful processing
            const previousIndex = lastProcessedIndex.current;
            lastProcessedIndex.current = currentLines.length;
            console.log('Updated processing index', {
                previous: previousIndex,
                new: lastProcessedIndex.current
            });
            
            // Back to listening
            setCurrentState('listening');
            return true; // Successfully processed, wait full interval
        } catch (error) {
            console.error('Error in processing states:', error);
            setCurrentState('listening');
            return false; // Error occurred, check again soon
        }
    }

    // Schedule the process to run every 6 seconds
    useScheduledProcess(processStates, 6000);

    const getDisplayText = (state: ThinkingState) => {
        switch (state) {
            case 'listening':
                return 'Listening...';
            case 'thinking':
                return 'Thinking...';
            case 'researching':
                return 'Researching...';
        }
    };

    // Keep linesRef up to date
    useEffect(() => {
        linesRef.current = lines;
    }, [lines]);

    // Update lastProcessedIndex when lines array changes
    useEffect(() => {
        if (lines.length === 0) {
            lastProcessedIndex.current = 0;
        }
    }, [lines]);

    // TODO(mj): every once in a while, check to see if we need to update the high-level summary
    // if (discernData.newHighLevelSummary) {
    //     updateHighLevelSummary(discernData.newHighLevelSummary);
    // }

    return (
        <div className="text-lg font-medium text-gray-600 w-full text-end">
            {getDisplayText(currentState)}
        </div>
    );
}