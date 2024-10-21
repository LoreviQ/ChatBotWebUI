import { useCallback } from "react";
import { useFetcher } from "@remix-run/react";

export function useMessageFetcher() {
    type BaseFetcherType = ReturnType<typeof useFetcher>;
    type Payload = any;

    const fetcher = useFetcher({
        key: "message-fetcher",
    }) as Omit<BaseFetcherType, "submit" | "json"> & {
        submit: (payload: Payload) => void;
        json?: Payload;
    };

    // We clone the original submit to avoid a recursive loop
    const originalSubmit = fetcher.submit as BaseFetcherType["submit"];
    fetcher.submit = useCallback(
        (payload: Payload) => {
            return originalSubmit(payload, {
                method: "POST",
                action: "/ophelia/chat/1",
                encType: "application/json",
            });
        },
        [originalSubmit]
    );
    return fetcher;
}
