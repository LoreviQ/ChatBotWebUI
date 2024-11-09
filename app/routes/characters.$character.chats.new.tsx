import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/react";

import { api, endpoints } from "../utils/api";
import { redirectIfNotLoggedIn } from "../utils/cookies";

// /characters/{character}/chats/new creates a new thread then redirects to it
export async function loader({ params, request }: LoaderFunctionArgs) {
    const _redirect = await redirectIfNotLoggedIn(request);
    if (_redirect) {
        return _redirect;
    }
    const payload = {
        username: "Oliver",
        character: params.character!,
    };
    const response = await api.post(endpoints.threads(), payload);
    const data = await response.data;
    return redirect(`/characters/${params.character!}/chats/${data}`);
}
