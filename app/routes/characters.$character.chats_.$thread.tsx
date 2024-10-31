import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

import { format, isSameDay, isToday, addDays, addSeconds } from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faArrowsRotate } from "@fortawesome/free-solid-svg-icons";
import { characterErrMessage } from "../utils/errors";
import { api, endpoints } from "../utils/api";
import type { Cookie } from "../utils/cookies";
import type { Character } from "./characters";
import { WarningDualText } from "../components/warnings";
import type { OutletContextFromCharacter } from "./characters.$character";

export type Message = {
    id: number;
    timestamp: string | Date;
    role: string;
    content: string;
};

type FetcherType = ReturnType<typeof useFetcher<typeof action>>;

export async function loader({ params }: LoaderFunctionArgs) {
    let messageData: Message[], messageStatus: number;
    // temporary, threads will be dynamic
    try {
        const response = await api().get(endpoints.threadMessages(params.thread!));
        messageData = await response.data;
        messageStatus = response.status;
    } catch (error) {
        messageData = [];
        messageStatus = 500;
    }
    return json({
        messages: { data: messageData, status: messageStatus },
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
                response = await api().post(endpoints.threadMessages(params.thread!), payload);
                return json({ type: "post_message", status: response.status });
            case "DELETE":
                const message_id = formData.get("message_id") as string;
                response = await api().delete(endpoints.message(message_id, "recent=true"));
                return json({ type: "delete_messages", status: response.status });
            case "PATCH":
                response = await api().get(endpoints.newThreadMessage(params.thread!));
                return json({ type: "get_messages", status: response.status });
        }
    } catch (error) {
        return json({ type: "error", status: 500 });
    }
}

// Entry point for this endpoint
export default function Chat() {
    const loaderData = useLoaderData<typeof loader>();
    const messages = loaderData.messages.data as Message[];
    const { userPrefs, character, posts, events, detached } = useOutletContext<OutletContextFromCharacter>();

    return (
        <div className="container mx-auto max-w-2xl">
            <FullChat
                character={character}
                messages={messages}
                userPrefs={userPrefs}
                thread={loaderData.params.thread!}
                detached={detached}
            />
        </div>
    );
}

// Renders the entire chat interface
interface FullChatProps {
    character: Character;
    messages: Message[];
    userPrefs: Cookie;
    thread: string;
    detached: boolean;
}
export function FullChat({ character, messages, userPrefs, thread, detached }: FullChatProps) {
    const fetcher = useChatFetcher(character.name, thread);

    // process message data
    let processedMessages = messages.map((message) => {
        return {
            ...message,
            timestamp: new Date(message.timestamp),
        };
    });
    processedMessages = processedMessages.sort((a, b) => {
        const timeDifference = b.timestamp.getTime() - a.timestamp.getTime();
        if (timeDifference !== 0) {
            return timeDifference;
        }
        return b.id - a.id;
    });

    // isTyping state
    const [isTyping, setIsTyping] = useState(false);
    useEffect(() => {
        const now = new Date();
        const isAnyMessageTyping = messages.some(
            (message) => message.timestamp > now && message.timestamp < addSeconds(now, 30)
        );
        setIsTyping(isAnyMessageTyping);
    }, [messages]);

    // isSpinning state
    const [isSpinning, setIsSpinning] = useState(false);

    // textareaValue state - Clears automatically when a message is sent
    const [textareaValue, setTextareaValue] = useState("");
    function hasTypeProperty(data: any): data is { type: string } {
        return data && typeof data.type === "string";
    }
    useEffect(() => {
        if (hasTypeProperty(fetcher.data) && fetcher.data.type === "post_message") {
            setTextareaValue("");
        }
    }, [fetcher.data]);

    return (
        <div className="flex flex-col h-screen">
            <div className="overflow-auto flex flex-grow flex-col-reverse custom-scrollbar pt-20">
                {messages.length === 0 ? (
                    characterErrMessage(`Send a message to ${character.name}!`)
                ) : (
                    <MessageBoxMap
                        messages={processedMessages}
                        character={character.name}
                        fetcher={fetcher}
                        userPrefs={userPrefs}
                    />
                )}
            </div>
            <IsTypingMessage isTyping={isTyping} character={character.name} />
            {detached ? (
                <WarningDualText
                    text1="The API is running in detached mode."
                    text2="Messages can be sent but responses will not be generated."
                />
            ) : (
                <GetResponseImmediately fetcher={fetcher} character={character.name} isSpinning={isSpinning} />
            )}
            <UserInputMessageBox
                fetcher={fetcher}
                character={character.name}
                textareaValue={textareaValue}
                setTextareaValue={setTextareaValue}
            />
        </div>
    );
}

interface MessageBoxMapProps {
    messages: Message[];
    character: string;
    fetcher: any;
    userPrefs: Cookie;
}
function MessageBoxMap({ messages, character, fetcher, userPrefs }: MessageBoxMapProps) {
    let lastDate: Date | null = null;
    return messages.map((message, index) => {
        const scheduledMessage = message.timestamp > new Date();
        if (scheduledMessage && !userPrefs.debug) {
            return null;
        }
        const showDateHeader = !lastDate || !isSameDay(lastDate, message.timestamp);
        const isLastMessage = index === messages.length - 1;
        lastDate = message.timestamp as Date;
        return (
            <MessageBox
                key={index}
                index={index}
                character={character}
                message={message}
                fetcher={fetcher}
                scheduledMessage={scheduledMessage}
                showDateHeader={showDateHeader}
                isLastMessage={isLastMessage}
            />
        );
    });
}

// Renders a single message box
interface MessageBoxProps {
    index: number;
    character: string;
    message: Message;
    fetcher: any;
    scheduledMessage: boolean;
    showDateHeader: boolean;
    isLastMessage: boolean;
}
function MessageBox({
    index,
    character,
    message,
    fetcher,
    scheduledMessage,
    showDateHeader,
    isLastMessage,
}: MessageBoxProps) {
    return (
        <div>
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

// Renders the "Character is typing..." message
interface IsTypingMessageProps {
    isTyping: boolean;
    character: string;
}
function IsTypingMessage({ isTyping, character }: IsTypingMessageProps) {
    if (isTyping) {
        return (
            <div className="flex items-center ps-8">
                <div className="loader me-6"></div>
                <small className="text-text-muted-dark">{character} is typing...</small>
            </div>
        );
    }
}

// Renders the "Get a response from Character immediately" button
interface GetResponseImmediatelyProps {
    fetcher: any;
    character: string;
    isSpinning: boolean;
}
function GetResponseImmediately({ fetcher, character, isSpinning }: GetResponseImmediatelyProps) {
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
interface UserInputMessageBoxProps {
    fetcher: any;
    character: string;
    textareaValue: string;
    setTextareaValue: (value: string) => void;
}
function UserInputMessageBox({ fetcher, character, textareaValue, setTextareaValue }: UserInputMessageBoxProps) {
    const placeholder_message = `Send a message to ${character}!\nEnter to send. Alt-Enter for linebreak.`;

    return (
        <fetcher.Form method="POST" action={fetcher.formAction}>
            <div className="flex items-center py-2 rounded-lg">
                <textarea
                    name="chat"
                    rows={4}
                    className="
                        block p-2.5 w-full text-sm rounded-lg border 
                        border-character 
                        bg-bg-dark placeholder-text-muted-dark text-text-dark
                        focus:border-character
                    "
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

// custom fetcher that always executes the /{character}/chat/{thread} action
export function useChatFetcher(character: string, thread: string) {
    const fetcher = useFetcher<FetcherType>({
        key: `chat-${character}-${thread}`,
    });
    fetcher.formAction = `/characters/${character}/chats/${thread}`;
    return fetcher;
}
