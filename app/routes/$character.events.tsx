import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher, useRevalidator } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";
import { useEffect } from "react";

import { prefs } from "./../utils/cookies";

type FetcherData = {
    ok: boolean;
    [key: string]: any;
};

export const meta: MetaFunction = () => {
    return [{ title: "Ophelia" }, { name: "description", content: "See what Ophelia's been up to" }];
};

export async function loader({ params, request }: LoaderFunctionArgs) {
    const cookieHeader = request.headers.get("Cookie");
    const cookie = (await prefs.parse(cookieHeader)) || {};
    return json({ userPrefs: { debug: cookie.debug } });
}

export default function Events() {
    const fetcher = useFetcher<FetcherData>();
    const loaderData = useLoaderData<typeof loader>();
    let { revalidate } = useRevalidator();

    // Revalidate the messages every second
    useEffect(() => {
        let id = setInterval(revalidate, 1000);
        return () => clearInterval(id);
    }, [revalidate]);

    return <div className="flex flex-col h-screen"></div>;
}
