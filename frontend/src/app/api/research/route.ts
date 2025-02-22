import { ResearchResponse } from "@/types/research";

export async function POST(request: Request) {
    const res = await request.json();
    // Add artificial delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Pull off the current topic and potential topics
    // Research relevant information and resources
    // Return research findings and recommendations
    const response: ResearchResponse = {
        newAdjacentTopics: [
            {title: "Rihanna's haircut", description: "Rihanna's haircut"},
            {title: "A$AP Ferg New Album", description: "A$AP Ferg New Album"},
            {title: "Rihanna's new album", description: "Rihanna's new album"}
        ],
        newStageProposals: [
            {
                text: "Rihanna's new album",
                claims: ["Rihanna's new album"]
            }
        ]
    };
    return Response.json(response);
}
