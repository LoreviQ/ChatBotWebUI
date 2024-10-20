import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useRevalidator } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";
import { format, parseISO, isSameDay, isToday, addDays } from "date-fns";
import { useEffect } from "react";

import type { Cookie } from "./../utils/cookies";
import { prefs } from "./../utils/cookies";
import { api, endpoints } from "../utils/api";

export type Event = {
    id: number;
    timestamp: string;
    content: string;
};

export const meta: MetaFunction = () => {
    return [{ title: "Ophelia" }, { name: "description", content: "See what Ophelia's been up to" }];
};

export async function loader({ params, request }: LoaderFunctionArgs) {
    let responseData: Event[], status: number;
    try {
        const response = await api.get(endpoints.characterEvents(params.character!));
        responseData = await response.data;
        status = response.status;
    } catch (error) {
        responseData = [];
        status = 500;
    }
    const cookieHeader = request.headers.get("Cookie");
    const cookie = (await prefs.parse(cookieHeader)) || {};
    return json({ events: responseData, userPrefs: { debug: cookie.debug }, status: status });
}

export default function Events() {
    const loaderData = useLoaderData<typeof loader>();
    const userPrefs = loaderData.userPrefs as Cookie;

    // Revalidate the messages every second
    let { revalidate } = useRevalidator();
    useEffect(() => {
        let id = setInterval(revalidate, 1000);
        return () => clearInterval(id);
    }, [revalidate]);

    return EventLog(loaderData.events, userPrefs, loaderData.status, false);
}

export function EventLog(eventResponse: Event[], userPrefs: Cookie, status: number, component: boolean) {
    let lastDate: Date | null = null;
    // process event data
    let events = eventResponse.map((event) => {
        return {
            ...event,
            timestamp: parseISO(event.timestamp + "Z"),
        };
    });
    events = events.sort((a, b) => {
        const timeDifference = b.timestamp.getTime() - a.timestamp.getTime();
        if (timeDifference !== 0) {
            return timeDifference;
        }
        return b.id - a.id;
    });
    return (
        <div className="flex flex-col h-screen">
            <div
                className={`overflow-auto flex flex-grow flex-col-reverse ${
                    component ? "hidden-scrollbar" : "custom-scrollbar"
                }`}
            >
                {events.length > 0 ? (
                    events.map((event, index) => {
                        const scheduledEvent = event.timestamp > new Date();
                        if (scheduledEvent && !userPrefs.debug) {
                            return null;
                        }
                        const showDateHeader = !lastDate || !isSameDay(lastDate, event.timestamp);
                        lastDate = event.timestamp;
                        const isLastEvent = index === events.length - 1;
                        return (
                            <div key={index}>
                                {isLastEvent ? (
                                    <div className="text-center text-text-muted-dark my-4">
                                        {format(event.timestamp, "MMMM do, yyyy")}
                                    </div>
                                ) : null}
                                <div className="w-full items-center rounded-lg my-2 py-1 hover:bg-hover-dark flex justify-between">
                                    <div className="flex flex-col w-full">
                                        <p className="px-4 text-xs text-text-muted-dark">
                                            {format(event.timestamp, "hh:mm a")}
                                        </p>
                                        <p className="py-1 px-4 break-words text-text-muted-dark">{event.content}</p>
                                    </div>
                                </div>
                                {showDateHeader && !isToday(event.timestamp) && index != 0 && (
                                    <div className="text-center text-text-muted-dark my-4">
                                        {format(addDays(event.timestamp, 1), "MMMM do, yyyy")}
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center text-text-muted-dark my-4">
                        {status === 500 ? "Error getting messages from server" : "Send a message to Ophelia!"}
                    </div>
                )}
            </div>
        </div>
    );
}
