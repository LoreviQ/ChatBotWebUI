import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useRevalidator } from "@remix-run/react";
import { useOutletContext } from "react-router-dom";
import { format, parseISO, isSameDay, isToday, addDays } from "date-fns";
import { useEffect } from "react";

import type { Cookie } from "../utils/cookies";
import { prefs } from "../utils/cookies";
import { api, endpoints } from "../utils/api";
import { characterErrMessage } from "../utils/errors";
import { WarningDualText } from "../components/warnings";
import type { OutletContextFromCharacter } from "./characters.$character";

export type Event = {
    id: number;
    timestamp: string | Date;
    type: string;
    content: string;
};

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
    const cookieHeader = request.headers.get("Cookie");
    const cookie = (await prefs.parse(cookieHeader)) || {};
    return json({ events: { data: eventData, status: eventStatus }, userPrefs: { debug: cookie.debug } });
}

export default function Events() {
    const loaderData = useLoaderData<typeof loader>();
    const events = loaderData.events.data as Event[];
    const userPrefs = loaderData.userPrefs as Cookie;
    const { character, detatched } = useOutletContext<OutletContextFromCharacter>();

    // Revalidate the events every minute
    let { revalidate } = useRevalidator();
    useEffect(() => {
        let id = setInterval(revalidate, 60000);
        return () => clearInterval(id);
    }, [revalidate]);

    return (
        <div className="container mx-auto max-w-2xl">
            <EventLog
                events={events}
                userPrefs={userPrefs}
                component={false}
                statuses={[loaderData.events.status]}
                detatched={detatched}
            />
        </div>
    );
}

interface EventLogProps {
    events: Event[];
    userPrefs: Cookie;
    component: boolean;
    statuses: number[];
    detatched: boolean;
}

export function EventLog({ events, userPrefs, component, statuses, detatched }: EventLogProps) {
    // Guard clauses
    statuses.map((status) => {
        if (status === 500) {
            return characterErrMessage("Error getting events from the server");
        }
    });
    if (events.length === 0) {
        return characterErrMessage("Oops! Looks like there are no events to show");
    }
    let lastDate: Date | null = null;
    // process events
    let processedEvents = events.map((event) => {
        return {
            ...event,
            timestamp: parseISO(event.timestamp + "Z"),
        };
    });
    processedEvents = processedEvents.sort((a, b) => {
        const timeDifference = b.timestamp.getTime() - a.timestamp.getTime();
        if (timeDifference !== 0) {
            return timeDifference;
        }
        return b.id - a.id;
    });

    return (
        <div className="flex flex-col h-screen">
            <div
                className={`overflow-auto flex flex-grow flex-col-reverse pt-20 ${
                    component ? "hidden-scrollbar" : "custom-scrollbar"
                }`}
            >
                {processedEvents.map((event, index) => {
                    const scheduledEvent = event.timestamp > new Date();
                    if (scheduledEvent && !userPrefs.debug) {
                        return null;
                    }
                    const showDateHeader = !lastDate || !isSameDay(lastDate, event.timestamp);
                    lastDate = event.timestamp;
                    const isLastEvent = index === processedEvents.length - 1;
                    return (
                        <Event
                            key={index}
                            event={event}
                            index={index}
                            showDateHeader={showDateHeader}
                            isLastEvent={isLastEvent}
                        />
                    );
                })}
            </div>
            {detatched && (
                <WarningDualText
                    text1="The API is running in detatched mode."
                    text2="New events will not be generated."
                />
            )}
        </div>
    );
}

// Renders a single event in the event log
interface EventProps {
    event: Event;
    index: number;
    showDateHeader: boolean;
    isLastEvent: boolean;
}
function Event({ event, index, showDateHeader, isLastEvent }: EventProps) {
    return (
        <div>
            {isLastEvent ? (
                <div className="text-center text-text-muted-dark my-4">{format(event.timestamp, "MMMM do, yyyy")}</div>
            ) : null}
            <div className="w-full items-center rounded-lg my-2 py-1 hover:bg-hover-dark flex justify-between">
                <div className="flex flex-col w-full">
                    <p className="px-4 text-xs text-text-muted-dark">
                        {`${event.type} - ${format(event.timestamp, "hh:mm a")}`}
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
}
