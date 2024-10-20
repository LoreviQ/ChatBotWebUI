import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher, useRevalidator } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";
import { format, parseISO, isSameDay, isToday, addDays } from "date-fns";
import { useRef, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faArrowsRotate } from "@fortawesome/free-solid-svg-icons";
import { prefs } from "./../utils/cookies";

import { api, endpoints } from "../utils/api";

interface Message {
    id: number;
    timestamp: string;
    role: string;
    content: string;
}

type FetcherData = {
    ok: boolean;
    [key: string]: any;
};

const postMessage = async (thread_id: string, content: string) => {
    if (!content) {
        return json({ type: "error", status: 400 });
    }
    const payload = {
        role: "user",
        content: content,
    };
    const response = await api.post(endpoints.threadMessages(thread_id), payload);
    return json({ type: "post_message", status: response.status });
};

export const meta: MetaFunction = () => {
    return [{ title: "Ophelia" }, { name: "description", content: "Chat with Ophelia" }];
};

export async function loader({ params, request }: LoaderFunctionArgs) {
    let responseData: Message[], status: number;
    try {
        const response = await api.get(endpoints.threadMessages(params.thread!));
        responseData = await response.data;
        status = response.status;
    } catch (error) {
        responseData = [];
        status = 500;
    }
    const cookieHeader = request.headers.get("Cookie");
    const cookie = (await prefs.parse(cookieHeader)) || {};
    return json({ messages: responseData, userPrefs: { debug: cookie.debug }, status: status });
}

export async function action({ params, request }: ActionFunctionArgs) {
    const formData = await request.formData();
    let response: Response;
    try {
        switch (request.method) {
            case "POST":
                const content = formData.get("chat") as string;
                return postMessage(params.thread!, content);
            case "DELETE":
                const message_id = formData.get("message_id") as string;
                response = await api.delete(endpoints.message(message_id));
                return json({ type: "delete_messages", status: response.status });
            case "PATCH":
                response = await api.get(endpoints.newMessage(params.thread!));
                return json({ type: "get_messages", status: response.status });
        }
    } catch (error) {
        return json({ type: "error", status: 500 });
    }
}

export default function Chat() {
    const fetcher = useFetcher<FetcherData>();
    const loaderData = useLoaderData<typeof loader>();
    const placeholder_message = "Send a message to Ophelia!\nEnter to send. Alt-Enter for linebreak.";
    let lastDate: Date | null = null;
    let { revalidate } = useRevalidator();
    const messages = loaderData.messages.sort((a, b) => {
        return parseISO(b.timestamp).getTime() - parseISO(a.timestamp).getTime();
    });

    // potentially remove this and use remix
    const [isSpinning, setIsSpinning] = useState(false);
    const [textareaValue, setTextareaValue] = useState("");

    // Clear the textarea when a message is sent
    useEffect(() => {
        if (fetcher.data?.type === "post_message") {
            setTextareaValue("");
        }
    }, [fetcher.data]);

    // Revalidate the messages every second
    useEffect(() => {
        let id = setInterval(revalidate, 1000);
        return () => clearInterval(id);
    }, [revalidate]);

    return (
        <div className="flex flex-col h-screen">
            <div className="overflow-auto flex flex-grow flex-col-reverse custom-scrollbar">
                {messages.length > 0 ? (
                    messages.map((message, index) => {
                        const messageDate = parseISO(message.timestamp);
                        const now = new Date();
                        const scheduledMessage = messageDate > now;
                        if (scheduledMessage && !loaderData.userPrefs.debug) {
                            return null;
                        }
                        const showDateHeader = !lastDate || !isSameDay(lastDate, messageDate);
                        lastDate = messageDate;
                        const isLastMessage = index === messages.length - 1;
                        return (
                            <div key={index}>
                                {isLastMessage ? (
                                    <div className="text-center text-text-muted-dark my-4">
                                        {format(messageDate, "MMMM do, yyyy")}
                                    </div>
                                ) : null}
                                <div className="w-full items-center rounded-lg my-2 py-1 hover:bg-hover-dark flex justify-between">
                                    <div className="flex flex-col w-full">
                                        <div className="flex justify-between">
                                            <b className="px-4" style={{ fontSize: "1.25em" }}>
                                                {message.role === "user" ? "Oliver" : "Ophelia"}
                                            </b>
                                            <fetcher.Form method="DELETE">
                                                <input type="hidden" name="message_id" value={message.id} />
                                                <button type="submit" className="px-4 text-primary-dark">
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            </fetcher.Form>
                                        </div>
                                        <p className="py-1 px-4 break-words">{message.content}</p>
                                        <div className="flex justify-end">
                                            <small
                                                className={`px-4 self-end ${
                                                    scheduledMessage ? "text-yellow-500" : "text-text-muted-dark"
                                                }`}
                                            >
                                                {format(messageDate, "hh:mm a")}
                                            </small>
                                        </div>
                                    </div>
                                </div>
                                {showDateHeader && !isToday(messageDate) && (
                                    <div className="text-center text-text-muted-dark my-4">
                                        {format(addDays(messageDate, 1), "MMMM do, yyyy")}
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center text-text-muted-dark my-4">
                        {loaderData.status === 500
                            ? "Error getting messages from server"
                            : "Send a message to Ophelia!"}
                    </div>
                )}
            </div>
            <fetcher.Form method="PATCH">
                <button type="submit" className="py-4 ps-4 pe-2 fa-lg text-primary-dark">
                    <FontAwesomeIcon className={isSpinning ? "fa-spin" : ""} icon={faArrowsRotate} />
                </button>
                <small className="text-text-muted-dark self-end">Get a response from Ophelia immediately</small>
            </fetcher.Form>
            <fetcher.Form method="POST">
                <div className="flex items-center py-2 rounded-lg">
                    <textarea
                        name="chat"
                        rows={4}
                        className="block p-2.5 w-full text-sm rounded-lg border text-gray-900 bg-white border-primary-dark dark:bg-bg-dark dark:placeholder-text-muted-dark dark:text-text-dark"
                        placeholder={placeholder_message}
                        value={textareaValue}
                        onChange={(e) => setTextareaValue(e.target.value)}
                        onKeyDown={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            if (e.key === "Enter" && !e.altKey) {
                                e.preventDefault();
                                target.form?.requestSubmit();
                            } else if (e.key === "Enter" && e.altKey) {
                                e.preventDefault();
                                const start = target.selectionStart;
                                const end = target.selectionEnd;
                                target.value = target.value.substring(0, start) + "\n" + target.value.substring(end);
                                target.selectionStart = target.selectionEnd = start + 1;
                            }
                        }}
                    />
                    <div className="flex flex-col items-center">
                        <button
                            type="submit"
                            className="inline-flex justify-center ps-4 p-2 text-primary-dark rounded-full cursor-pointer"
                        >
                            <svg
                                className="w-5 h-5 rotate-90 rtl:-rotate-90"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="currentColor"
                                viewBox="0 0 18 20"
                            >
                                <path d="m17.914 18.594-8-18a1 1 0 0 0-1.828 0l-8 18a1 1 0 0 0 1.157 1.376L8 18.281V9a1 1 0 0 1 2 0v9.281l6.758 1.689a1 1 0 0 0 1.156-1.376Z" />
                            </svg>
                            <span className="sr-only">Send message</span>
                        </button>
                    </div>
                </div>
            </fetcher.Form>
        </div>
    );
}
