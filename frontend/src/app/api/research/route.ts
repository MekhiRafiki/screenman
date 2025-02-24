import { ResearchResponse } from "@/types/research";
import { ChatOpenAI } from "@langchain/openai";
import { DuckDuckGoSearch } from "@langchain/community/tools/duckduckgo_search";
import { z } from "zod";
import { QUERY_GENERATION_PROMPT, RESEARCH_ANALYSIS_PROMPT } from "@/prompts/research";
import { analytics } from "@/utils/analytics";

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

const modelChoice = "gpt-4-turbo-preview";

const model = new ChatOpenAI({
    temperature: 0,
    modelName: modelChoice
});

const searchTool = new DuckDuckGoSearch({ maxResults: 3 });

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(request: Request) {
    const startTime = Date.now();
    const traceId = `research_${startTime}`;
    const { currentTopic, claims } = await request.json();

    try {
        // Step 1: Generate optimized search queries
        const queryPrompt = QUERY_GENERATION_PROMPT.replace(
            "{currentTopic}",
            currentTopic ? `${currentTopic?.title} - ${currentTopic?.description}` : 'No established topic at the moment'
        ).replace(
            "{claims}",
            claims ? claims.join('\n') : 'No original claims provided'
        );
        const queryStartTime = Date.now();
        const queryGenerator = model.withStructuredOutput(searchQueriesSchema);
        const searchQueries = await queryGenerator.invoke(queryPrompt);
        
        analytics.captureAIGeneration({
            traceId: `${traceId}_queries`,
            model: modelChoice,
            input: [{ role: "user", content: queryPrompt }],
            outputChoices: [{ role: "assistant", content: JSON.stringify(searchQueries) }],
            latency: (Date.now() - queryStartTime) / 1000,
            httpStatus: 200,
            isError: false
        });

        // Only take the first 3 queries if there are more
        const limitedQueries = searchQueries.queries.slice(0, 3);
        // Step 2: Execute searches and gather results with delay
        const searchResults = [];
        for (const q of limitedQueries) {
            try {
                const results = await searchTool.invoke(q.query);
                searchResults.push({
                    query: q.query,
                    claim: q.relatedClaim,
                    results
                });
                // Add 1 second delay between searches
                await delay(800);
            } catch (error) {
                console.error(`Error searching for query "${q.query}":`, error);
                // Continue with other queries if one fails
                continue;
            }
        }

        // Step 3: Analyze results and generate proposals
        const analysisPrompt = RESEARCH_ANALYSIS_PROMPT
            .replace("{currentTopic}", currentTopic ? `${currentTopic?.title} - ${currentTopic?.description}` : 'No established topic at the moment')
            .replace("{claims}", claims.join("\n"))
            .replace("{searchResults}", JSON.stringify(searchResults, null, 2));
            
        const analysisStartTime = Date.now();
        const researchAnalyzer = model.withStructuredOutput(proposalsSchema);
        const analysis = await researchAnalyzer.invoke(analysisPrompt);
        
        analytics.captureAIGeneration({
            traceId: `${traceId}_analysis`,
            model: modelChoice,
            input: [{ role: "user", content: analysisPrompt }],
            outputChoices: [{ role: "assistant", content: JSON.stringify(analysis) }],
            latency: (Date.now() - analysisStartTime) / 1000,
            httpStatus: 200,
            isError: false
        });

        // Step 4: Format and return response
        const response: ResearchResponse = {
            newStageProposals: analysis.stageProposals,
            newAdjacentTopics: analysis.adjacentTopics
        };

        return Response.json(response);
    } catch (error) {
        const errorTime = Date.now();
        analytics.captureAIGeneration({
            traceId,
            model: modelChoice,
            input: [{ 
                role: "user", 
                content: JSON.stringify({ currentTopic, claims }) 
            }],
            latency: (errorTime - startTime) / 1000,
            httpStatus: 500,
            isError: true,
            error: error instanceof Error ? error.message : 'Unknown error'
        });

        console.error('Error in research:', error);
        return Response.json({ error: 'Failed to process research' }, { status: 500 });
    }
}
