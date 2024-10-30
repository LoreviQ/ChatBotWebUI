import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/react";
import { api, endpoints } from "../utils/api";

// /characters/{character}/chat is a redirect to the latest thread (/characters/{character}/chats/{thread})
export async function loader({ params, request }: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const baseUrl = url.pathname.endsWith("/") ? url.pathname.slice(0, -1) : url.pathname;
    const query = `username=Oliver&char_path=${params.character!}&limit=1`;
    const response = await api().get(endpoints.threads(query));
    const data = await response.data;
    const thread_id = data[0].id;
    return redirect(`${baseUrl}s/${thread_id}`);
}
