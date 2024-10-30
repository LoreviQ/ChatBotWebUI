import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/react";
import { api, endpoints } from "../utils/api";

// /characters/{character}/chats/new creates a new thread then redirects to it
export async function loader({ params, request }: LoaderFunctionArgs) {
    const payload = {
        username: "Oliver",
        character: params.character!,
    };
    const response = await api().post(endpoints.threads(), payload);
    const data = await response.data;
    console.log(data);
    return redirect(`/characters/${params.character!}/chats/${data}`);
}
