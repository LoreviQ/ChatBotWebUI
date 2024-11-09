import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { useOutletContext } from "react-router-dom";
import { json } from "@remix-run/node";
import { formatDistanceToNow } from "date-fns";

import type { OutletContextFromCharacter } from "./characters.$character";
import { api, endpoints, imageURL } from "../utils/api";
import { redirectIfNotLoggedIn } from "../utils/cookies";

export type Threads = {
    id: number;
    started: string | Date;
    character: string;
    char_path: string;
    profile_path: string;
    recent_message: string;
};

export async function loader({ params, request }: LoaderFunctionArgs) {
    const _redirect = await redirectIfNotLoggedIn(request);
    if (_redirect) {
        return _redirect;
    }
    let threadData: Threads[], threadStatus: number;
    try {
        const query = `char_path=${params.character}`;
        const response = await api.get(endpoints.usersThreads("Oliver", query));
        threadData = await response.data;
        threadStatus = response.status;
    } catch (error) {
        threadData = [];
        threadStatus = 500;
    }
    return json({
        threads: { data: threadData, status: threadStatus },
    });
}

export default function Threads() {
    const loaderData = useLoaderData<typeof loader>()!;
    const threads = loaderData.threads.data as Threads[];
    const { userPrefs, character, posts, events, detached } = useOutletContext<OutletContextFromCharacter>();

    return (
        <div className="container mx-auto max-w-2xl">
            <div className="flex flex-col h-screen ">
                <div className=" flex flex-col flex-grow custom-scrollbar pt-24 space-y-4">
                    <ThreadBoxMap threads={threads} />
                </div>
            </div>
        </div>
    );
}

interface ThreadBoxMapProps {
    threads: Threads[];
}
function ThreadBoxMap({ threads }: ThreadBoxMapProps) {
    return threads.map((threads, index) => {
        return (
            <ThreadBox
                key={index}
                id={threads.id}
                started={threads.started}
                character={threads.character}
                char_path={threads.char_path}
                profile_path={threads.profile_path}
                recent_message={threads.recent_message}
            />
        );
    });
}

interface ThreadBoxProps {
    id: number;
    started: string | Date;
    character: string;
    char_path: string;
    profile_path: string;
    recent_message: string;
}
function ThreadBox({ id, started, character, char_path, profile_path, recent_message }: ThreadBoxProps) {
    return (
        <Link to={`/characters/${char_path}/chats/${id}`}>
            <div className="px-4 py-4 bg-black/50 rounded-lg">
                <div className="flex w-full">
                    <img className="rounded-full w-16 me-8" src={imageURL(profile_path)} />
                    <div className="flex flex-col">
                        <div className="flex">
                            <p className="pe-4 text-xl">{character}</p>
                            <p className="text-text-muted-dark">
                                {formatDistanceToNow(new Date(started), { addSuffix: true })}
                            </p>
                        </div>
                        <p className="pt-2 px-6">Most recent message from this chat</p>
                    </div>
                </div>
            </div>
        </Link>
    );
}
