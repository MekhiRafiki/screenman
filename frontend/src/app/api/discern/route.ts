export async function POST(request: Request) {
    const res = await request.json()
    // Add artificial delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Pull off the running summary and current topic
    // Pull off the current new lines of conversation
    // Return updates to the optional values for the HighLevelSummary, CurrentTopic, PotentialTopics
    return Response.json({ res })
}