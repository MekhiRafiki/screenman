import { ChatOpenAI } from "@langchain/openai";
import { DiscernResponse, Topic } from "@/types/research";
import { z } from "zod";

// Define the schema for our structured output
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

const model = new ChatOpenAI({
    temperature: 0,
    modelName: "gpt-4-turbo-preview",
});

const structuredLlm = model.withStructuredOutput(discernSchema);

const SYSTEM_PROMPT = `You are an AI analyzing a real-time conversation transcript to identify topics, themes, and claims. Your task is to:

1. TOPIC TRACKING:
   - Identify if the conversation has shifted to a new topic
   - Only suggest a topic change if there's a clear shift in subject matter
   - Consider the current topic when deciding if there's a genuine change

2. SUMMARY UPDATES:
   - Only provide a new summary if the conversation's overall direction has significantly changed
   - The summary should capture the key themes and progression of the discussion

3. CLAIM EXTRACTION:
   - Identify specific claims, statements, or cohesive thoughts that could be researched
   - Include both factual claims and interesting statements worth exploring
   - Each claim should be self-contained and clear enough to research

IMPORTANT:
- Only include fields in the response if they represent genuine changes or new information
- It's valid and expected to return empty optional fields when no significant changes are detected
- Focus on quality over quantity - only extract meaningful claims and genuine topic shifts`;

export async function POST(request: Request) {
    const { highLevelSummary, currentTopic, newLines } = await request.json();
    
    const userPrompt = `
        ${SYSTEM_PROMPT}
        Current State:
        ${highLevelSummary ? `High-level Summary: ${highLevelSummary}` : 'No current summary'}
        ${currentTopic ? `Current Topic: ${currentTopic.title} - ${currentTopic.description}` : 'No current topic'}

        New Conversation Lines:
        ${newLines.map((line: any) => line.text).join('\n')}

        Analyze these new lines in the context of the current state and provide structured output for any necessary updates.`

    try {
        const result = await structuredLlm.invoke(userPrompt);
        
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
        console.error('Error in discernment:', error);
        return Response.json({ error: 'Failed to process conversation' }, { status: 500 });
    }
}

// newHighLevelSummary: z.string().optional().describe(
//     "A new or updated high-level summary of the entire conversation. Only provide if the new lines significantly change the conversation's direction."
// ),