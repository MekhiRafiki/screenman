import { useEffect, useRef, useCallback } from 'react';

export function useScheduledProcess(
    process: () => Promise<boolean>,
    intervalMs: number,
    enabled: boolean = true
) {
    const isRunningRef = useRef(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const scheduleNext = useCallback((delay: number) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(runProcess, delay);
    }, []);

    const runProcess = useCallback(async () => {
        if (!enabled || isRunningRef.current) return;

        try {
            isRunningRef.current = true;
            await process();
        } catch (error) {
            console.error('Process error:', error);
        } finally {
            isRunningRef.current = false;
            // Always schedule next run after completion, regardless of success/failure
            scheduleNext(intervalMs);
        }
    }, [enabled, intervalMs, process]);

    useEffect(() => {
        // Initial run
        void runProcess();

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [enabled, intervalMs]);
}
