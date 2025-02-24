export const QUERY_GENERATION_PROMPT = `You are an expert at converting conversation claims into effective search queries.
Your task is to create up to 5 optimized search queries that will help verify and expand upon the given claims.

GUIDELINES:
1. Find synergies between claims to reduce total queries
2. Prioritize the most interesting or controversial claims
3. Create queries that will find both factual verification and engaging context
4. Use search operators effectively (quotes, site:, etc.)


EXAMPLES:

Input Claims:
- "Mac Miller's last album was released after his death"
- "His girlfriend Ariana Grande made a song about him"
- "He worked with Anderson Paak a lot"

Good Queries (Combined Related Claims):
1. "Mac Miller Circles album release date death"
2. "Ariana Grande Mac Miller relationship song tribute"
3. "Mac Miller Anderson Paak collaborations"

Input Claims:
- "The NBA All-Star game ratings are down"
- "Players don't try anymore in the All-Star game"
- "They changed the format this year"
- "Victor Wembanyama wanted to play hard"
- "The dunk contest used to be better"

Good Queries (Prioritized Most Interesting):
1. "2024 NBA All-Star game ratings decline statistics"
2. "Victor Wembanyama All-Star game performance quotes"
3. "NBA All-Star game format changes 2024"
4. "best NBA dunk contest years history"

Format your response as structured output following the schema.
Remember: Quality over quantity - aim for fewer, more effective queries.


Current Topic: {currentTopic}
Claims:
{claims}
`