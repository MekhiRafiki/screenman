import { ResearchResponse, Topic, ResearchStageProposals } from "@/types/research";
import { ChatOpenAI } from "@langchain/openai";
import { DuckDuckGoSearch } from "@langchain/community/tools/duckduckgo_search";
import { z } from "zod";

// Schema for generating optimized search queries
const searchQueriesSchema = z.object({
    queries: z.array(z.object({
        query: z.string().describe("An optimized search query for finding accurate information"),
        relatedClaim: z.string().describe("The original claim this query is investigating")
    })).describe("List of search queries to investigate the claims")
});

// Schema for processing search results into proposals
const proposalsSchema = z.object({
    stageProposals: z.array(z.object({
        text: z.string().describe("A clear, factual statement that confirms, corrects, or adds context to the original claims"),
        claims: z.array(z.string()).describe("List of specific claims or facts from the research"),
        webUrls: z.array(z.string()).optional().describe("Relevant source URLs")
    })),
    adjacentTopics: z.array(z.object({
        title: z.string().describe("A concise title for a related topic worth exploring"),
        description: z.string().describe("Brief explanation of why this topic is relevant")
    }))
});

const model = new ChatOpenAI({
    temperature: 0,
    modelName: "gpt-4-turbo-preview"
});

const searchTool = new DuckDuckGoSearch({ maxResults: 3 });

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const QUERY_GENERATION_PROMPT = `You are an expert at converting conversation claims into effective search queries.
Your task is to create optimized search queries that will help verify and expand upon the given claims.

Current Topic: {currentTopic}

For each claim, create 1-2 search queries that will:
1. Help verify the accuracy of the claim
2. Find additional context or related information
3. Be optimized for web search (use quotes for exact phrases, focus on key terms)

Format your response as structured output following the schema.`;

const RESEARCH_ANALYSIS_PROMPT = `You are an expert at analyzing search results and extracting valuable insights.
Your task is to create two types of content:

1. Stage Proposals:
   - Verify or correct the original claims
   - Provide additional context and details
   - Use specific facts from the search results
   - Include relevant source URLs

2. Adjacent Topics:
   - Identify interesting related topics worth exploring
   - Focus on topics that naturally flow from the current discussion
   - Ensure topics are substantive and have enough depth for discussion

Current Topic: {currentTopic}
Original Claims:
{claims}

Search Results:
{searchResults}

Format your response as structured output following the schema.
Focus on accuracy and relevance. Less is more - only include high-quality proposals and truly interesting adjacent topics.`;

export async function POST(request: Request) {
    const { currentTopic, claims } = await request.json();

    try {
        // Step 1: Generate optimized search queries
        const queryGenerator = model.withStructuredOutput(searchQueriesSchema);
        const searchQueries = await queryGenerator.invoke(QUERY_GENERATION_PROMPT.replace(
            "{currentTopic}",
            `${currentTopic.title} - ${currentTopic.description}`
        ));

        // Step 2: Execute searches and gather results with delay
        const searchResults = [];
        for (const q of searchQueries.queries) {
            try {
                const results = await searchTool.invoke(q.query);
                searchResults.push({
                    query: q.query,
                    claim: q.relatedClaim,
                    results
                });
                // Add 1 second delay between searches
                await delay(500);
            } catch (error) {
                console.error(`Error searching for query "${q.query}":`, error);
                // Continue with other queries if one fails
                continue;
            }
        }

        // Step 3: Analyze results and generate proposals
        const researchAnalyzer = model.withStructuredOutput(proposalsSchema);
        const analysis = await researchAnalyzer.invoke(
            RESEARCH_ANALYSIS_PROMPT
                .replace("{currentTopic}", `${currentTopic.title} - ${currentTopic.description}`)
                .replace("{claims}", claims.join("\n"))
                .replace("{searchResults}", JSON.stringify(searchResults, null, 2))
        );

        // Step 4: Format and return response
        const response: ResearchResponse = {
            newStageProposals: analysis.stageProposals,
            newAdjacentTopics: analysis.adjacentTopics
        };

        return Response.json(response);
    } catch (error) {
        console.error('Error in research:', error);
        return Response.json({ error: 'Failed to process research' }, { status: 500 });
    }
}
