import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher, useRevalidator } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";
import { format, parseISO, isSameDay, isToday, addDays, addSeconds } from "date-fns";
import { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faArrowsRotate } from "@fortawesome/free-solid-svg-icons";
import type { Cookie } from "./../utils/cookies";
import { prefs } from "./../utils/cookies";
import { api, endpoints } from "../utils/api";

interface EventResponse {
    id: number;
    timestamp: string;
    content: string;
}

interface Event {
    id: number;
    timestamp: Date;
    content: string;
}

type FetcherData = {
    ok: boolean;
    [key: string]: any;
};

export const meta: MetaFunction = () => {
    return [{ title: "Ophelia" }, { name: "description", content: "See what Ophelia's been up to" }];
};

export async function loader({ params, request }: LoaderFunctionArgs) {
    let responseData: EventResponse[], status: number;
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
    let { revalidate } = useRevalidator();
    const userPrefs = loaderData.userPrefs as Cookie;

    // Revalidate the messages every second
    useEffect(() => {
        let id = setInterval(revalidate, 1000);
        return () => clearInterval(id);
    }, [revalidate]);

    return EventLog(loaderData.events, userPrefs, loaderData.status);
}

export function EventLog(eventsT: EventResponse[], userPrefs: Cookie, status: number) {
    let lastDate: Date | null = null;
    const fetcher = useFetcher<FetcherData>();
    // process event data
    let events = eventsT.map((event) => {
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
            <div className="overflow-auto flex flex-grow flex-col-reverse custom-scrollbar">
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
                                        <div className="flex justify-between">
                                            <p className="py-1 px-4 break-words ">{event.content}</p>
                                            <fetcher.Form method="DELETE">
                                                <input type="hidden" name="message_id" value={event.id} />
                                                <button type="submit" className="px-4 text-primary-dark">
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            </fetcher.Form>
                                        </div>

                                        <div className="flex justify-end">
                                            <small
                                                className={`px-4 self-end ${
                                                    scheduledEvent ? "text-yellow-500" : "text-text-muted-dark"
                                                }`}
                                            >
                                                {format(event.timestamp, "hh:mm a")}
                                            </small>
                                        </div>
                                    </div>
                                </div>
                                {showDateHeader && !isToday(event.timestamp) && (
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
