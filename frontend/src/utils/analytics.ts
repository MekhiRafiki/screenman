import { PostHog } from "posthog-node"

// Initialize PostHog client
const client = new PostHog(
    process.env.NEXT_PUBLIC_POSTHOG_KEY || '',
    { host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com' }
)

interface AIGenerationProps {
    traceId: string;
    model: string;
    input: { role: string; content: string }[];
    outputChoices?: { role: string; content: string }[];
    latency: number;
    httpStatus: number;
    isError: boolean;
    error?: string | Error;
}

export const captureAIGeneration = ({
    traceId,
    model,
    input,
    outputChoices,
    latency,
    httpStatus,
    isError,
    error
}: AIGenerationProps) => {
    client.capture({
        distinctId: 'system',
        event: '$ai_generation',
        properties: {
            $ai_trace_id: traceId,
            $ai_model: model,
            $ai_provider: "openai",
            $ai_input: input,
            ...(outputChoices && { $ai_output_choices: outputChoices }),
            $ai_latency: latency,
            $ai_http_status: httpStatus,
            $ai_is_error: isError,
            ...(error && { $ai_error: error instanceof Error ? error.message : error }),
            $ai_base_url: "https://api.openai.com/v1"
        }
    });
}

export const analytics = {
    captureAIGeneration
}
