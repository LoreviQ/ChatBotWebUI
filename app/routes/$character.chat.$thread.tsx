import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";
import { format, parseISO, isSameDay } from "date-fns";
import React, { useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

import { api, endpoints } from "../utils/api";

interface Message {
    message_id: number;
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
        return json({ status: "error", message: "Message is empty" }, { status: 400 });
    }
    const payload = {
        role: "user",
        content: content,
    };
    const response = await api.post(endpoints.threadMessages(thread_id), payload);
    return json({ status: response.status });
};

export const meta: MetaFunction = () => {
    return [{ title: "Ophelia" }, { name: "description", content: "Chat with Ophelia" }];
};

export async function loader({ params }: LoaderFunctionArgs) {
    const response = await api.get(endpoints.threadMessages(params.thread!));
    const responseData: Message[] = await response.data;
    return json(responseData, { status: response.status });
}

export async function action({ params, request }: ActionFunctionArgs) {
    const formData = await request.formData();
    switch (request.method) {
        case "POST":
            const content = formData.get("chat") as string;
            return postMessage(params.thread!, content);
        case "DELETE":
            const message_id = formData.get("message_id") as string;
            const response = await api.delete(endpoints.message(message_id));
            return json({ status: response.status });
    }
}

export default function Chat() {
    const fetcher = useFetcher<FetcherData>();
    const messages = useLoaderData<typeof loader>();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const lastMessageRef = useRef<HTMLDivElement>(null);
    const placeholder_message = "Send a message to Ophelia!\nEnter to send. Alt-Enter for linebreak.";
    let lastDate: Date | null = null;

    // Reset the form after a successful submission
    useEffect(
        function resetFormOnSuccess() {
            if (fetcher.state === "idle" && fetcher.data?.ok) {
                if (textareaRef.current) {
                    textareaRef.current.value = "";
                }
            }
        },
        [fetcher.state, fetcher.data]
    );

    // Scroll to the last message when a new message is added
    useEffect(() => {
        if (lastMessageRef.current) {
            lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    return (
        <div>
            <div className="flex flex-col h-screen">
                <div className="overflow-auto flex-grow custom-scrollbar">
                    {messages.map((message, index) => {
                        const messageDate = parseISO(message.timestamp);
                        const showDateHeader = !lastDate || !isSameDay(lastDate, messageDate);
                        lastDate = messageDate;

                        return (
                            <div key={index} ref={index === messages.length - 1 ? lastMessageRef : null}>
                                {showDateHeader && (
                                    <div className="text-center text-text-muted-dark my-4">
                                        {format(messageDate, "MMMM do, yyyy")}
                                    </div>
                                )}
                                <div className="w-full items-center rounded-lg my-2 py-1 hover:bg-hover-dark flex justify-between">
                                    <div className="flex flex-col w-full">
                                        <div className="flex justify-between">
                                            <b className="px-4" style={{ fontSize: "1.25em" }}>
                                                {message.role === "user" ? "Oliver" : "Ophelia"}
                                            </b>
                                            <fetcher.Form method="delete">
                                                <input type="hidden" name="message_id" value={message.message_id} />
                                                <button type="submit" className="px-4 text-primary-dark">
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            </fetcher.Form>
                                        </div>
                                        <p className="py-1 px-4 break-words">{message.content}</p>
                                        <div className="flex justify-end">
                                            <small className="px-4 text-text-muted-dark self-end">
                                                {format(messageDate, "hh:mm a")}
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <fetcher.Form method="post">
                    <div className="flex items-center py-2 rounded-lg">
                        <textarea
                            ref={textareaRef}
                            name="chat"
                            rows={4}
                            className="block p-2.5 w-full text-sm rounded-lg border text-gray-900 bg-white border-primary-dark dark:bg-bg-dark dark:placeholder-text-muted-dark dark:text-text-dark"
                            placeholder={placeholder_message}
                            onKeyDown={(e) => {
                                const target = e.target as HTMLTextAreaElement;
                                if (e.key === "Enter" && !e.altKey) {
                                    e.preventDefault();
                                    target.form?.requestSubmit();
                                } else if (e.key === "Enter" && e.altKey) {
                                    e.preventDefault();
                                    const start = target.selectionStart;
                                    const end = target.selectionEnd;
                                    target.value =
                                        target.value.substring(0, start) + "\n" + target.value.substring(end);
                                    target.selectionStart = target.selectionEnd = start + 1;
                                }
                            }}
                        />
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
                </fetcher.Form>
            </div>
        </div>
    );
}
