import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Outlet } from "@remix-run/react";
import { useOutletContext } from "react-router-dom";
import { json } from "@remix-run/node";

import type { OutletContextFromCharacters } from "./characters";
import type { Character } from "./characters";
import type { Post } from "./characters.$character.posts";
import type { Event } from "./characters.$character.events";
import type { Cookie } from "../utils/cookies";
import { api, endpoints } from "../utils/api";

export interface OutletContextFromCharacter {
    userPrefs: Cookie;
    character: Character;
    posts: Post[];
    events: Event[];
    detached: boolean;
}

export async function loader({ params }: LoaderFunctionArgs) {
    let eventData: Event[], eventStatus: number;
    try {
        const response = await api.get(endpoints.characterEvents(params.character!));
        eventData = await response.data;
        eventStatus = response.status;
    } catch (error) {
        eventData = [];
        eventStatus = 500;
    }
    let postData: Post[], postStatus: number;
    try {
        const response = await api.get(endpoints.characterPosts(params.character!));
        postData = await response.data;
        postStatus = response.status;
    } catch (error) {
        postData = [];
        postStatus = 500;
    }
    const response = await api.get(endpoints.detached());
    const detached = (await response.data) === "True";
    return json({
        events: { data: eventData, status: eventStatus },
        posts: { data: postData, status: postStatus },
        detached,
    });
}

export default function CharactersData() {
    const { character, userPrefs } = useOutletContext<OutletContextFromCharacters>();
    const loaderData = useLoaderData<typeof loader>();
    return (
        <div>
            <Outlet
                context={{
                    userPrefs,
                    character,
                    posts: loaderData.posts.data as Post[],
                    events: loaderData.events.data as Event[],
                    detached: loaderData.detached,
                }}
            />
        </div>
    );
}
