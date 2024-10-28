import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useRevalidator } from "@remix-run/react";
import { useOutletContext } from "react-router-dom";
import { useEffect } from "react";

import type { Event } from "./characters.$character.events";
import type { Post } from "./characters.$character.posts";
import type { Message } from "./characters.$character.chat.$thread";
import type { Cookie } from "../utils/cookies";
import type { OutletContextFromCharacter } from "./characters.$character";
import { FullChat } from "./characters.$character.chat.$thread";
import { PostLog } from "./characters.$character.posts";
import { EventLog } from "./characters.$character.events";
import { prefs } from "../utils/cookies";
import { api, endpoints } from "../utils/api";

export async function loader({ params, request }: LoaderFunctionArgs) {
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
        events: { data: eventData, status: eventStatus },
        messages: { data: messageData, status: messageStatus },
        posts: { data: postData, status: postStatus },
        userPrefs: { debug: cookie.debug },
        params: params,
    });
}

export default function CharacterAll() {
    const loaderData = useLoaderData<typeof loader>();
    const { character, detatched } = useOutletContext<OutletContextFromCharacter>();
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
                        detatched={detatched}
                    />
                </div>
                <div className="w-1/3">
                    <FullChat
                        character={character}
                        messages={messages}
                        userPrefs={userPrefs}
                        thread={"1"}
                        statuses={[loaderData.messages.status]}
                        detatched={detatched}
                    />
                </div>
                <div className="w-1/3">
                    <PostLog
                        character={character}
                        posts={posts}
                        userPrefs={userPrefs}
                        component={false}
                        statuses={[loaderData.posts.status]}
                        detatched={detatched}
                    />
                </div>
            </div>
        </div>
    );
}
