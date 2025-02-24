import { ChatOpenAI } from "@langchain/openai"
import { DiscernResponse } from "@/types/research"
import { z } from "zod"
import { TranscriptionLine } from "@/types/transcription"
import { CLAIM_EXTRACTOR_PROMPT } from "@/prompts/research"
import { analytics } from "@/utils/analytics"

const discernSchema = z.object({
    newCurrentTopic: z.object({
        title: z.string().describe("A concise title for the current topic of discussion"),
        description: z.string().describe("A brief description explaining the topic"),
        timestamp: z.string().optional()
    }).optional().describe(
        "Information about a new topic if the conversation has shifted. Only provide if there's a clear topic change."
    ),
    claims: z.array(z.string()).optional().describe(
        "List of factual claims, statements, or cohesive thoughts that could be researched or verified. Each claim should be a complete, standalone statement."
    )
});

const modelChoice = "gpt-4-turbo-preview";

const model = new ChatOpenAI({
    temperature: 0,
    modelName: modelChoice,
});

const structuredLlm = model.withStructuredOutput(discernSchema);

export async function POST(request: Request) {
    const startTime = Date.now();
    const traceId = `discern_${startTime}`;
    const { highLevelSummary, currentTopic, newLines } = await request.json();
    
    const userPrompt = `
        ${CLAIM_EXTRACTOR_PROMPT}
        ### New content to generate from: ###
        Current State:
        ${highLevelSummary ? `High-level Summary: ${highLevelSummary}` : 'No current summary'}

        ${currentTopic ? `Current Topic: ${currentTopic.title} - ${currentTopic.description}` : 'No current topic'}

        New Conversation Lines:
        ${newLines.map((line: TranscriptionLine) => line.text).join('\n')}

        Analyze these new lines in the context of the current state and provide structured output for research.`

    try {
        const result = await structuredLlm.invoke(userPrompt);
        
        analytics.captureAIGeneration({
            traceId,
            model: modelChoice,
            input: [{ role: "user", content: userPrompt }],
            outputChoices: [{ role: "assistant", content: JSON.stringify(result) }],
            latency: (Date.now() - startTime) / 1000,
            httpStatus: 200,
            isError: false
        });
        
        // Convert to DiscernResponse type and ensure timestamp is set if there's a new topic
        const response: DiscernResponse = {
            ...result,
            newCurrentTopic: result.newCurrentTopic ? {
                ...result.newCurrentTopic,
                timestamp: new Date().toISOString()
            } : undefined
        };

        return Response.json(response);
    } catch (error) {
        analytics.captureAIGeneration({
            traceId,
            model: modelChoice,
            input: [{ role: "user", content: userPrompt }],
            latency: (Date.now() - startTime) / 1000,
            httpStatus: 500,
            isError: true,
            error: error instanceof Error ? error.message : 'Unknown error'
        });

        console.error('Error in discernment:', error);
        return Response.json({ error: 'Failed to process conversation' }, { status: 500 });
    }
}