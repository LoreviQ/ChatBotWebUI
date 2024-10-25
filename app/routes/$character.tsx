import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { prefs } from "./../utils/cookies";
import { useLoaderData, useFetcher, useSubmit, useOutlet, useRevalidator, useNavigate } from "@remix-run/react";
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
    const [primaryColour, setPrimaryColour] = useState("#0000FF");
    const [thread, setThread] = useState("1");

    useEffect(() => {
        if (loaderData.character.data.favorite_colour) {
            setPrimaryColour(loaderData.character.data.favorite_colour);
        }
        // temporary, threads will be dynamic
        if (loaderData.params.character === "test") {
            setThread("2");
        } else if (loaderData.params.character === "steve") {
            setThread("3");
        }
    }, [loaderData]);
    // Revalidate the messages every second
    let { revalidate } = useRevalidator();
    useEffect(() => {
        let id = setInterval(revalidate, 1000);
        return () => clearInterval(id);
    }, [revalidate]);

    return (
        <div style={{ "--color-primary": primaryColour } as React.CSSProperties}>
            {Header(loaderData.character.data, userPrefs)}
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

function Header(character: Character, userPrefs: Cookie) {
    const fetcher = useFetcher();
    const submit = useSubmit();
    const [model, setModel] = useState(false);
    const navigate = useNavigate();
    return (
        <div>
            <div
                className="
                    absolute top-0 left-0 w-full h-20 flex items-center
                    backdrop-blur-sm backdrop-saturate-200 backdrop-contrast-150 bg-bg-dark/50 
                    border-b-4 border-character
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
            <button
                className="absolute z-40 mt-4 left-1/2 transform -translate-x-1/2 text-5xl font-ophelia font-outline"
                type="button"
                onClick={() => setModel(!model)}
            >
                {character.name}
            </button>
            <div
                className={`
                    flex text-xl justify-between absolute z-50 left-1/2 
                    transform -translate-x-1/2 p-2 rounded-lg bg-bg-dark 
                    border-2 border-t-4 border-character
                    ${model ? "" : "hidden"}
                    `}
                style={{ top: "76px" }}
            >
                <button className="px-4 mx-2 py-2" onClick={() => navigate(`/${character.path_name}/events`)}>
                    Events
                </button>
                <button className="px-4 mx-2 py-2" onClick={() => navigate(`/${character.path_name}/chat/1`)}>
                    Chat
                </button>
                <button className="px-4 mx-2 py-2" onClick={() => navigate(`/${character.path_name}/posts`)}>
                    Posts
                </button>
            </div>
        </div>
    );
}
