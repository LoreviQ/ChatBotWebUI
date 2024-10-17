import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useParams } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";
import { format, parseISO, isSameDay } from "date-fns";

interface Message {
    timestamp: string;
    role: string;
    content: string;
}

export const meta: MetaFunction = () => {
    return [{ title: "Ophelia" }, { name: "description", content: "Chat with Ophelia" }];
};

export async function loader({ params }: LoaderFunctionArgs) {
    console.log(params);
    const response = await fetch(`http://localhost:5000/threads/${params.thread}/messages`);
    const data: Message[] = await response.json();
    return json(data);
}

export default function Chat() {
    const messages = useLoaderData<typeof loader>();
    const placeholder_message = "Send a message to Ophelia!\nEnter to send. Alt-Enter for linebreak.";
    let lastDate: Date | null = null;
    return (
        <div>
            {messages.map((message, index) => {
                const messageDate = parseISO(message.timestamp);
                const showDateHeader = !lastDate || !isSameDay(lastDate, messageDate);
                lastDate = messageDate;

                return (
                    <div key={index}>
                        {showDateHeader && (
                            <div className="text-center text-gray-500 my-4">{format(messageDate, "MMMM do, yyyy")}</div>
                        )}
                        <div className="w-full items-center rounded-lg my-2 py-1 hover:bg-zinc-800 flex justify-between">
                            <div>
                                <b className="px-4" style={{ fontSize: "1.25em" }}>
                                    {message.role === "user" ? "Oliver" : "Ophelia"}
                                </b>
                                <p className="py-1 px-4">{message.content}</p>
                            </div>
                            <small className="px-4 text-gray-500 self-end">{format(messageDate, "hh:mm a")}</small>
                        </div>
                    </div>
                );
            })}
            <form>
                <div className="flex items-center py-2 rounded-lg">
                    <textarea
                        id="chat"
                        rows={4}
                        className="block p-2.5 w-full text-sm rounded-lg border text-gray-900 bg-white border-pink-600 dark:bg-zinc-900 dark:placeholder-gray-400 dark:text-white"
                        placeholder={placeholder_message}
                    ></textarea>
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
            </form>
        </div>
    );
}
