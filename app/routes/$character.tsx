import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { prefs } from "./../utils/cookies";
import { useLoaderData, useFetcher, useSubmit, useOutlet, useRevalidator, useNavigate } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";
import type { Event } from "./$character.events";
import { EventLog } from "./$character.events";
import type { Post } from "./$character_.posts";
import { PostLog } from "./$character_.posts";
import type { Message } from "./$character.chat.$thread";
import { fullChatInterface } from "./$character.chat.$thread";
import type { Cookie } from "./../utils/cookies";
import { api, endpoints } from "../utils/api";
import { useEffect, useState } from "react";

export type Character = {
    id: number;
    name: string;
    path_name: string;
    description: string;
    age: number;
    height: string;
    personality: string;
    appearance: string;
    loves: string;
    hates: string;
    details: string;
    scenario: string;
    important: string;
    initial_message: string;
    favorite_colour: string;
    phases: boolean;
    img_gen: boolean;
    model: string;
    global_positive: string;
    global_negative: string;
    profile_path: string;
};

export const meta: MetaFunction = () => {
    return [{ title: "Ophelia" }, { name: "description", content: "All about Ophelia" }];
};

export async function loader({ params, request }: LoaderFunctionArgs) {
    let characterData: Character, characterStatus: number;
    try {
        const response = await api.get(endpoints.characterByPath(params.character!));
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
    let thread = "1";
    if (params.character === "test") {
        thread = "2";
    } else if (params.character === "steve") {
        thread = "3";
    }
    try {
        const response = await api.get(endpoints.threadMessages(thread));
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

export async function action({ request }: ActionFunctionArgs) {
    const cookieHeader = request.headers.get("Cookie");
    const cookie = (await prefs.parse(cookieHeader)) || {};
    const formData = await request.formData();
    let debug: boolean = false;
    if (formData.has("debug")) {
        debug = true;
    }
    cookie.debug = debug;
    return json(debug, {
        headers: {
            "Set-Cookie": await prefs.serialize(cookie),
        },
    });
}

export default function Character() {
    const loaderData = useLoaderData<typeof loader>();
    const userPrefs = loaderData.userPrefs as Cookie;
    const outlet = useOutlet();

    const [thread, setThread] = useState("1");

    // Revalidate the messages every second
    let { revalidate } = useRevalidator();
    useEffect(() => {
        let id = setInterval(revalidate, 1000);
        return () => clearInterval(id);
    }, [revalidate]);

    return (
        <div>
            {outlet ? (
                <div className="container mx-auto max-w-2xl">{outlet}</div>
            ) : (
                <div className="flex">
                    <div className="w-1/3">
                        {EventLog(loaderData.events.data, userPrefs, true, loaderData.events.status)}
                    </div>
                    <div className="w-1/3">
                        {fullChatInterface(
                            loaderData.messages.data,
                            userPrefs,
                            loaderData.character.data,
                            thread,
                            loaderData.messages.status
                        )}
                    </div>
                    <div className="w-1/3">
                        {PostLog(loaderData.character.data, loaderData.posts.data, userPrefs, true, [
                            loaderData.character.status,
                            loaderData.posts.status,
                        ])}
                    </div>
                </div>
            )}
        </div>
    );
}
