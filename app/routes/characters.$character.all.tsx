import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useOutletContext } from "react-router-dom";
import { useLoaderData } from "@remix-run/react";

import type { OutletContextFromCharacter } from "./characters.$character";
import { api, endpoints } from "../utils/api";
import { FullChat } from "./characters.$character.chats_.$thread";
import { PostLog } from "./characters.$character.posts";
import { EventLog } from "./characters.$character.events";
import type { Message } from "./characters.$character.chats_.$thread";

export async function loader({}: LoaderFunctionArgs) {
    let messageData: Message[], messageStatus: number;
    // temporary, threads will be dynamic
    try {
        const response = await api().get(endpoints.threadMessages("1"));
        messageData = await response.data;
        messageStatus = response.status;
    } catch (error) {
        messageData = [];
        messageStatus = 500;
    }
    return json({
        messages: { data: messageData, status: messageStatus },
    });
}

export default function CharacterAll() {
    const loaderData = useLoaderData<typeof loader>();
    const messages = loaderData.messages.data as Message[];
    const { userPrefs, character, posts, events, detached } = useOutletContext<OutletContextFromCharacter>();

    return (
        <div>
            <div className="flex">
                <div className="w-1/3">
                    <EventLog events={events} userPrefs={userPrefs} component={false} detached={detached} />
                </div>
                <div className="w-1/3">
                    <FullChat
                        character={character}
                        messages={messages}
                        userPrefs={userPrefs}
                        thread={"1"}
                        detached={detached}
                    />
                </div>
                <div className="w-1/3">
                    <PostLog
                        posts={posts}
                        userPrefs={userPrefs}
                        hideSidebar={false}
                        detached={detached}
                        pad={true}
                        border={false}
                        load={false}
                        loaderRef={undefined}
                        loading={undefined}
                    />
                </div>
            </div>
        </div>
    );
}
