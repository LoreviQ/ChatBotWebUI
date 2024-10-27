import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { prefs } from "../utils/cookies";
import { useLoaderData, useRevalidator } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";
import type { Event } from "./characters_.$character_.events";
import { EventLog } from "./characters_.$character_.events";
import type { Post } from "./characters_.$character_.posts";
import { PostLog } from "./characters_.$character_.posts";
import type { Message } from "./characters_.$character_.chat.$thread";
import { FullChat } from "./characters_.$character_.chat.$thread";
import type { Cookie } from "../utils/cookies";
import { api, endpoints } from "../utils/api";
import { useEffect } from "react";
import type { Character } from "./characters";

export const meta: MetaFunction = () => {
    return [{ title: "Ophelia" }, { name: "description", content: "All about Ophelia" }];
};

export async function loader({ params, request }: LoaderFunctionArgs) {
    let characterData: Character, characterStatus: number;
    try {
        const response = await api.get(endpoints.character(params.character!));
        characterData = await response.data;
        characterStatus = response.status;
    } catch (error) {
        characterData = {} as Character;
        characterStatus = 500;
    }
    let eventData: Event[], eventStatus: number;
    try {
        const response = await api.get(endpoints.characterEvents(params.character!));
        eventData = await response.data;
        eventStatus = response.status;
    } catch (error) {
        eventData = [];
        eventStatus = 500;
    }
    let messageData: Message[], messageStatus: number;
    // temporary, threads will be dynamic
    try {
        const response = await api.get(endpoints.threadMessages("1"));
        messageData = await response.data;
        messageStatus = response.status;
    } catch (error) {
        messageData = [];
        messageStatus = 500;
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
    const cookieHeader = request.headers.get("Cookie");
    const cookie = (await prefs.parse(cookieHeader)) || {};
    return json({
        character: { data: characterData, status: characterStatus },
        events: { data: eventData, status: eventStatus },
        messages: { data: messageData, status: messageStatus },
        posts: { data: postData, status: postStatus },
        userPrefs: { debug: cookie.debug },
        params: params,
    });
}

export default function CharacterAll() {
    const loaderData = useLoaderData<typeof loader>();
    const character = loaderData.character.data as Character;
    const events = loaderData.events.data as Event[];
    const messages = loaderData.messages.data as Message[];
    const posts = loaderData.posts.data as Post[];
    const userPrefs = loaderData.userPrefs as Cookie;

    // Revalidate the data every 10 seconds
    let { revalidate } = useRevalidator();
    useEffect(() => {
        let id = setInterval(revalidate, 10000);
        return () => clearInterval(id);
    }, [revalidate]);

    return (
        <div>
            <div className="flex">
                <div className="w-1/3">
                    <EventLog
                        events={events}
                        userPrefs={userPrefs}
                        component={false}
                        statuses={[loaderData.events.status]}
                    />
                </div>
                <div className="w-1/3">
                    <FullChat
                        character={character}
                        messages={messages}
                        userPrefs={userPrefs}
                        thread={"1"}
                        statuses={[loaderData.character.status, loaderData.messages.status]}
                    />
                </div>
                <div className="w-1/3">
                    <PostLog
                        character={character}
                        posts={posts}
                        userPrefs={userPrefs}
                        component={false}
                        statuses={[loaderData.character.status, loaderData.posts.status]}
                    />
                </div>
            </div>
        </div>
    );
}
