import type { MetaFunction, LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher, useRevalidator } from "@remix-run/react";
import { useEffect, useState } from "react";

import { format, parseISO, isSameDay, isToday, addDays, addSeconds } from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faArrowsRotate } from "@fortawesome/free-solid-svg-icons";

import { prefs } from "./../utils/cookies";
import { api, endpoints } from "../utils/api";
import type { Cookie } from "./../utils/cookies";
import type { Character } from "./$character";

export type Message = {
    id: number;
    timestamp: string;
    role: string;
    content: string;
};

type ProcessedMessage = {
    id: number;
    timestamp: Date;
    role: string;
    content: string;
};

type FetcherType = ReturnType<typeof useFetcher<typeof action>>;

export const meta: MetaFunction = () => {
    return [{ title: "Ophelia" }, { name: "description", content: "Chat with Ophelia" }];
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
    let messageData: Message[], messageStatus: number;
    try {
        const response = await api.get(endpoints.threadMessages(params.thread!));
        messageData = await response.data;
        messageStatus = response.status;
    } catch (error) {
        messageData = [];
        messageStatus = 500;
    }
    const cookieHeader = request.headers.get("Cookie");
    const cookie = (await prefs.parse(cookieHeader)) || {};
    return json({
        character: { data: characterData, status: characterStatus },
        messages: { data: messageData, status: messageStatus },
        userPrefs: { debug: cookie.debug },
        params: params,
    });
}

export async function action({ params, request }: ActionFunctionArgs) {
    const formData = await request.formData();
    let response: Response;
    try {
        switch (request.method) {
            case "POST":
                const content = formData.get("chat") as string;
                if (!content) {
                    return json({ type: "error", status: 400 });
                }
                const payload = { role: "user", content: content };
                response = await api.post(endpoints.threadMessages(params.thread!), payload);
                return json({ type: "post_message", status: response.status });
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

// Entry point for this endpoint
export default function Chat() {
    const loaderData = useLoaderData<typeof loader>();
    let { revalidate } = useRevalidator();
    const userPrefs = loaderData.userPrefs as Cookie;

    // Revalidate the messages every second
    useEffect(() => {
        let id = setInterval(revalidate, 1000);
        return () => clearInterval(id);
    }, [revalidate]);

    return fullChatInterface(
        loaderData.messages.data,
        userPrefs,
        loaderData.character.data,
        loaderData.params.thread!,
        loaderData.messages.status
    );
}

// This function is used to render the full chat interface
export function fullChatInterface(
    messages: Message[],
    userPrefs: Cookie,
    character: Character,
    thread: string,
    status: number
) {
    const fetcher = useChatFetcher(character.name, thread);
    let lastDate: Date | null = null;

    // process message data
    let processedMessages = messages.map((message) => {
        return {
            ...message,
            timestamp: parseISO(message.timestamp + "Z"),
        };
    });
    processedMessages = processedMessages.sort((a, b) => {
        const timeDifference = b.timestamp.getTime() - a.timestamp.getTime();
        if (timeDifference !== 0) {
            return timeDifference;
        }
        return b.id - a.id;
    });
    return (
        <div className="flex flex-col h-screen">
            <div className="overflow-auto flex flex-grow flex-col-reverse custom-scrollbar pt-20">
                {processedMessages.length > 0 ? (
                    processedMessages.map((message, index) => {
                        const mb = messageBox(
                            message,
                            character.name,
                            index,
                            processedMessages.length,
                            userPrefs,
                            lastDate,
                            fetcher
                        );
                        lastDate = message.timestamp;
                        return mb;
                    })
                ) : (
                    <div className="text-center text-text-muted-dark my-4">
                        {status === 500 ? "Error getting messages from server" : `Send a message to ${character}!`}
                    </div>
                )}
            </div>
            {isTypingMessage(processedMessages, character.name)}
            {getResponseImmediately(fetcher, character.name)}
            {userInputMessageBox(fetcher, character.name)}
        </div>
    );
}

// Renders a single message in the chat interface
function messageBox(
    message: ProcessedMessage,
    character: string,
    index: number,
    messagesLen: number,
    userPrefs: Cookie,
    lastDate: Date | null,
    fetcher: any
) {
    const scheduledMessage = message.timestamp > new Date();
    if (scheduledMessage && !userPrefs.debug) {
        return null;
    }
    const showDateHeader = !lastDate || !isSameDay(lastDate, message.timestamp);

    const isLastMessage = index === messagesLen - 1;
    return (
        <div key={index}>
            {isLastMessage ? (
                <div className="text-center text-text-muted-dark my-4">
                    {format(message.timestamp, "MMMM do, yyyy")}
                </div>
            ) : null}
            <div className="w-full items-center rounded-lg my-2 py-1 hover:bg-hover-dark flex justify-between">
                <div className="flex flex-col w-full">
                    <div className="flex justify-between">
                        <b className="px-4" style={{ fontSize: "1.25em" }}>
                            {message.role === "user" ? "Oliver" : character}
                        </b>
                        <fetcher.Form method="DELETE" action={fetcher.formAction}>
                            <input type="hidden" name="message_id" value={message.id} />
                            <button type="submit" className="px-4 text-character">
                                <FontAwesomeIcon icon={faTrash} />
                            </button>
                        </fetcher.Form>
                    </div>
                    <p className="py-1 px-4 break-words">{message.content}</p>
                    <div className="flex justify-end">
                        <small
                            className={`px-4 self-end ${scheduledMessage ? "text-yellow-500" : "text-text-muted-dark"}`}
                        >
                            {format(message.timestamp, "hh:mm a")}
                        </small>
                    </div>
                </div>
            </div>
            {showDateHeader && !isToday(message.timestamp) && (
                <div className="text-center text-text-muted-dark my-4">
                    {format(addDays(message.timestamp, 1), "MMMM do, yyyy")}
                </div>
            )}
        </div>
    );
}

// Renders the "Ophelia is typing..." message
function isTypingMessage(messages: ProcessedMessage[], character: string) {
    const [isTyping, setIsTyping] = useState(false);
    useEffect(() => {
        const now = new Date();
        const isAnyMessageTyping = messages.some(
            (message) => message.timestamp > now && message.timestamp < addSeconds(now, 30)
        );
        setIsTyping(isAnyMessageTyping);
    }, [messages]);
    if (isTyping) {
        return (
            <div className="flex items-center ps-8">
                <div className="loader me-6"></div>
                <small className="text-text-muted-dark">{character} is typing...</small>
            </div>
        );
    }
}

// Renders the "Get a response from Ophelia immediately" button
function getResponseImmediately(fetcher: any, character: string) {
    const [isSpinning, setIsSpinning] = useState(false);
    return (
        <fetcher.Form method="PATCH" className="py-4 ps-4" action={fetcher.formAction}>
            <button type="submit" className="pe-2 fa-lg text-character">
                <FontAwesomeIcon className={isSpinning ? "fa-spin" : ""} icon={faArrowsRotate} />
            </button>
            <small className="text-text-muted-dark self-end">Get a response from {character} immediately</small>
        </fetcher.Form>
    );
}

// Renders the user input message box
function userInputMessageBox(fetcher: any, character: string) {
    const placeholder_message = `Send a message to ${character}!\nEnter to send. Alt-Enter for linebreak.`;
    const [textareaValue, setTextareaValue] = useState("");

    // Clear the textarea when a message is sent
    function hasTypeProperty(data: any): data is { type: string } {
        return data && typeof data.type === "string";
    }
    useEffect(() => {
        if (hasTypeProperty(fetcher.data) && fetcher.data.type === "post_message") {
            setTextareaValue("");
        }
    }, [fetcher.data]);

    return (
        <fetcher.Form method="POST" action={fetcher.formAction}>
            <div className="flex items-center py-2 rounded-lg">
                <textarea
                    name="chat"
                    rows={4}
                    className="block p-2.5 w-full text-sm rounded-lg border text-gray-900 bg-white border-character dark:bg-bg-dark dark:placeholder-text-muted-dark dark:text-text-dark"
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
                        className="inline-flex justify-center ps-4 p-2 text-character rounded-full cursor-pointer"
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
    );
}

export function useChatFetcher(character: string, thread: string) {
    const fetcher = useFetcher<FetcherType>({
        key: `chat-${character}-${thread}`,
    });
    fetcher.formAction = `/${character}/chat/${thread}`;
    return fetcher;
}
