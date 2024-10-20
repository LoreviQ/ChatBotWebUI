import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { prefs } from "./../utils/cookies";
import { useLoaderData, useFetcher, useSubmit, useOutlet, useRevalidator } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";
import type { Event } from "./$character.events";
import { EventLog } from "./$character.events";
import type { Message } from "./$character.chat.$thread";
import { MessageLog } from "./$character.chat.$thread";
import type { Cookie } from "./../utils/cookies";
import { api, endpoints } from "../utils/api";
import { useEffect } from "react";

export const meta: MetaFunction = () => {
    return [{ title: "Ophelia" }, { name: "description", content: "All about Ophelia" }];
};

export async function loader({ params, request }: LoaderFunctionArgs) {
    let eventData: Event[], eventStatus: number, messageData: Message[], messageStatus: number;
    try {
        const response = await api.get(endpoints.characterEvents(params.character!));
        eventData = await response.data;
        eventStatus = response.status;
    } catch (error) {
        eventData = [];
        eventStatus = 500;
    }
    try {
        const response = await api.get(endpoints.threadMessages("1"));
        messageData = await response.data;
        messageStatus = response.status;
    } catch (error) {
        messageData = [];
        messageStatus = 500;
    }
    const cookieHeader = request.headers.get("Cookie");
    const cookie = (await prefs.parse(cookieHeader)) || {};
    return json({
        events: { data: eventData, status: eventStatus },
        messages: { data: messageData, status: messageStatus },
        userPrefs: { debug: cookie.debug },
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

export default function Header() {
    const fetcher = useFetcher();
    const loaderData = useLoaderData<typeof loader>();
    const userPrefs = loaderData.userPrefs as Cookie;
    const submit = useSubmit();
    const outlet = useOutlet();

    // Revalidate the messages every second
    let { revalidate } = useRevalidator();
    useEffect(() => {
        let id = setInterval(revalidate, 1000);
        return () => clearInterval(id);
    }, [revalidate]);

    return (
        <div>
            <div
                className="
                    absolute top-0 left-0 w-full h-20 flex items-center
                    backdrop-blur-sm backdrop-saturate-200 backdrop-contrast-150 bg-bg-dark/50 
                    border-double border-b-4 border-primary-dark
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
                            defaultChecked={loaderData.userPrefs.debug}
                        />
                        <div
                            className="
                                relative w-11 h-6 rounded-full
                                bg-hover-dark
                                peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full  peer-checked:bg-primary-dark
                                after:content-[''] after:absolute after:top-[2px] after:start-[2px] 
                                after:border after:border-hover-dark peer-checked:after:border-white after:bg-white 
                                after:rounded-full after:h-5 after:w-5 after:transition-all  
                            "
                        ></div>
                        <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Debug</span>
                    </label>
                </fetcher.Form>
            </div>
            <p className="absolute mt-4 left-1/2 transform -translate-x-1/2 text-5xl font-ophelia font-outline">
                Ophelia
            </p>
            {outlet ? (
                <div className="container mx-auto max-w-2xl">{outlet}</div>
            ) : (
                <div className="flex">
                    <div className="w-1/3">
                        {EventLog(loaderData.events.data, userPrefs, loaderData.events.status, true)}
                    </div>
                    <div className="w-1/3">
                        {MessageLog(loaderData.messages.data, userPrefs, loaderData.messages.status)}
                    </div>
                    <div className="w-1/3"></div>
                </div>
            )}
        </div>
    );
}
