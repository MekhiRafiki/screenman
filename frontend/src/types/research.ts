export interface Topic {
    title: string;
    description: string;
    timestamp?: string;
}

export interface DiscernResponse {
    newCurrentTopic?: Topic
    claims?: string[]
}

/**
 * Information to be displayed on the Stage as a result of the research stage.
 */
export interface ResearchStageProposals {
    text: string
    claims: string[]
    webUrls?: string[]
}

/**
 * Information to be returned from the research stage.
 */
export interface ResearchResponse {
    newAdjacentTopics?: Topic[]
    newStageProposals?: ResearchStageProposals[]
}

