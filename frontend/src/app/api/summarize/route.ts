import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import { Topic } from "@/types/research";

const summarySchema = z.object({
    summary: z.string().describe(
        "A concise, natural-sounding summary of the conversation flow, incorporating past topics and the current topic."
    )
});

const model = new ChatOpenAI({
    temperature: 0.7,
    modelName: "gpt-4-turbo-preview",
});

const structuredLlm = model.withStructuredOutput(summarySchema);

const SYSTEM_PROMPT = `You are a conversation summarizer that creates engaging, flowing summaries of discussions.
Your task is to create a natural, concise summary that captures the progression and flow of topics in a conversation.

GUIDELINES:
1. Focus on the FLOW of conversation:
   - How topics connect and transition
   - Key themes that emerge
   - The natural progression of ideas

2. Writing Style:
   - Use natural, conversational language
   - Avoid formal or academic tone
   - Make it sound like someone casually explaining what was discussed

3. Structure:
   - Start with the main theme or most recent significant topic
   - Weave in how the conversation evolved
   - Connect related topics when possible

EXAMPLES:

Input Topics:
- Past: "NBA All-Star Game", "Decline in player effort"
- Current: "Improving the format of the NBA All-Star Game"

Good Summary:
"The conversation started with reactions to this year's NBA All-Star Game, noting how player engagement has dropped over the years. This led to a deeper discussion about why stars don't take it seriously anymore, ultimately exploring various ideas to make the event more competitive and meaningful."

Input Topics:
- Past: "Super Bowl Halftime Show", "Usher's Performance", "Historical Performances"
- Current: "Impact of streaming on music industry"

Good Summary:
"What began as a breakdown of Usher's Super Bowl performance evolved into comparing iconic halftime shows of the past. This naturally led to a broader conversation about how streaming has changed the music industry and how artists approach live performances today."

IMPORTANT:
- Keep it concise (2-3 sentences)
- Focus on the natural flow between topics
- Make it sound conversational, not like a formal report
- Consider the previous summary for context, but don't feel bound by it`;

export async function POST(request: Request) {
    const { summary, pastTopics, currentTopic }: {
        summary: string | null,
        pastTopics: Topic[],
        currentTopic: Topic
    } = await request.json();
    
    const userPrompt = `
        ${SYSTEM_PROMPT}

        Previous Summary: ${summary || 'No previous summary'}

        Past Topics:
        ${pastTopics.map(topic => `- ${topic.title}: ${topic.description}`).join('\n')}

        Current Topic:
        ${currentTopic.title}: ${currentTopic.description}

        Create a natural, flowing summary that captures how this conversation has evolved.`;

    try {
        const result = await structuredLlm.invoke(userPrompt);
        return Response.json(result.summary);
    } catch (error) {
        console.error('Error in summarize route:', error);
        return Response.json({ error: 'Failed to generate summary' }, { status: 500 });
    }
}