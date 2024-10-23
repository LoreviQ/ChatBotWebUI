import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { prefs } from "./../utils/cookies";
import { useLoaderData, useFetcher, useSubmit, useOutlet, useRevalidator } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";
import type { Event } from "./$character.events";
import { EventLog } from "./$character.events";
import type { Post } from "./$character.posts";
import { PostLog } from "./$character.posts";
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
    const [primaryColour, setPrimaryColour] = useState("#0000FF");
    const [characterName, setCharacterName] = useState("");
    useEffect(() => {
        if (loaderData.character.data.favorite_colour) {
            console.log(loaderData.character.data.favorite_colour);
            setPrimaryColour(loaderData.character.data.favorite_colour);
        }
        if (loaderData.character.data.name) {
            setCharacterName(loaderData.character.data.name);
        }
    }, [loaderData.character.data]);
    // Revalidate the messages every second
    let { revalidate } = useRevalidator();
    useEffect(() => {
        let id = setInterval(revalidate, 1000);
        return () => clearInterval(id);
    }, [revalidate]);

    return (
        <div style={{ "--color-primary": primaryColour } as React.CSSProperties}>
            {Header(characterName, userPrefs)}
            {outlet ? (
                <div className="container mx-auto max-w-2xl">{outlet}</div>
            ) : (
                <div className="flex">
                    <div className="w-1/3">{EventLog(loaderData.events, userPrefs, true)}</div>
                    <div className="w-1/3">{fullChatInterface(loaderData.messages, userPrefs, "ophelia", "1")}</div>
                    <div className="w-1/3">{PostLog(loaderData.posts, userPrefs, true)}</div>
                </div>
            )}
        </div>
    );
}

function Header(characterName: string, userPrefs: Cookie) {
    const fetcher = useFetcher();
    const submit = useSubmit();
    return (
        <div>
            <div
                className="
                    absolute top-0 left-0 w-full h-20 flex items-center
                    backdrop-blur-sm backdrop-saturate-200 backdrop-contrast-150 bg-bg-dark/50 
                    border-double border-b-4 border-character
                    z-40
                "
            >
                <fetcher.Form
                    className="p-4"
                    onChange={(e) => {
                        submit(e.currentTarget, { method: "post", navigate: false });
                    }}
                >
                    <label className="inline-flex items-center cursor-pointer">
                        <input
                            name="debug"
                            type="checkbox"
                            value={1}
                            className="sr-only peer"
                            defaultChecked={userPrefs.debug}
                        />
                        <div
                            className="
                                relative w-11 h-6 rounded-full
                                bg-hover-dark
                                peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full  peer-checked:bg-character
                                after:content-[''] after:absolute after:top-[2px] after:start-[2px] 
                                after:border after:border-hover-dark peer-checked:after:border-white after:bg-white 
                                after:rounded-full after:h-5 after:w-5 after:transition-all  
                            "
                        ></div>
                        <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Debug</span>
                    </label>
                </fetcher.Form>
            </div>
            <p className="absolute z-50 mt-4 left-1/2 transform -translate-x-1/2 text-5xl font-ophelia font-outline">
                {characterName}
            </p>
        </div>
    );
}
