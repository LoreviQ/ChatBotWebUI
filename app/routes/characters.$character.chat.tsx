import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/react";

import { api, endpoints } from "../utils/api";
import { redirectIfNotLoggedIn } from "../utils/cookies";

// /characters/{character}/chat is a redirect to the latest thread (/characters/{character}/chats/{thread})
export async function loader({ params, request }: LoaderFunctionArgs) {
    const _redirect = await redirectIfNotLoggedIn(request);
    if (_redirect) {
        return _redirect;
    }
    const url = new URL(request.url);
    const baseUrl = url.pathname.endsWith("/") ? url.pathname.slice(0, -1) : url.pathname;
    const query = `username=Oliver&char_path=${params.character!}&limit=1`;
    const response = await api().get(endpoints.threads(query));
    const data = await response.data;
    if (data.length === 0) {
        return redirect(`${baseUrl}s/new`);
    }
    const thread_id = data[0].id;
    return redirect(`${baseUrl}s/${thread_id}`);
}
