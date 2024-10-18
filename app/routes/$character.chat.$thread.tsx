import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";
import { format, parseISO, isSameDay } from "date-fns";
import React, { useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

interface Message {
    timestamp: string;
    role: string;
    content: string;
}

type FetcherData = {
    ok: boolean;
    [key: string]: any;
};

export const meta: MetaFunction = () => {
    return [{ title: "Ophelia" }, { name: "description", content: "Chat with Ophelia" }];
};

export async function loader({ params }: LoaderFunctionArgs) {
    console.log(params);
    const response = await fetch(`http://localhost:5000/threads/${params.thread}/messages`);
    const data: Message[] = await response.json();
    return json(data);
}

// Submit a message to the server
export async function action({ params, request }: ActionFunctionArgs) {
    const formData = await request.formData();
    const content = formData.get("chat") as string;
    if (!content) {
        return json({ status: "error", message: "Message is empty" }, { status: 400 });
    }
    const fetcherURL = `http://localhost:5000/threads/${params.thread}/messages`;
    const payload = {
        role: "user",
        content: content,
    };
    await fetch(fetcherURL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });
    return json({ status: "success" });
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
                                    <div className="text-center text-gray-500 my-4">
                                        {format(messageDate, "MMMM do, yyyy")}
                                    </div>
                                )}
                                <div className="w-full items-center rounded-lg my-2 py-1 hover:bg-zinc-800 flex justify-between">
                                    <div className="flex flex-col w-full">
                                        <div className="flex justify-between">
                                            <b className="px-4" style={{ fontSize: "1.25em" }}>
                                                {message.role === "user" ? "Oliver" : "Ophelia"}
                                            </b>
                                            <button className="px-4 text-pink-600">
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        </div>
                                        <p className="py-1 px-4 break-words">{message.content}</p>
                                        <div className="flex justify-end">
                                            <small className="px-4 text-gray-500 self-end">
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
                            className="block p-2.5 w-full text-sm rounded-lg border text-gray-900 bg-white border-pink-600 dark:bg-zinc-900 dark:placeholder-gray-400 dark:text-white"
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
                            className="inline-flex justify-center ps-4 p-2 text-pink-600 rounded-full cursor-pointer"
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
