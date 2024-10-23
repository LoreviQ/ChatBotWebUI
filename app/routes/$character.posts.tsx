import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useRevalidator } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";
import { parseISO, formatDistanceToNow } from "date-fns";
import { useEffect } from "react";

import type { Cookie } from "./../utils/cookies";
import { prefs } from "./../utils/cookies";
import { api, endpoints } from "../utils/api";
import type { Character } from "./$character";
import { characterErrMessage } from "../utils/errors";

export type Post = {
    id: number;
    timestamp: string;
    description: string;
    prompt: string;
    caption: string;
    image_path: string;
};

export const meta: MetaFunction = () => {
    return [{ title: "Ophelia" }, { name: "description", content: "See Ophelia's posts" }];
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
    let postData: Post[], postStatus: number;
    try {
        const response = await api.get(endpoints.characterPosts(params.character!));
        postData = await response.data;
        postStatus = response.status;
    } catch (error) {
        postData = [];
        postStatus = 500;
    }
    const cookieHeader = request.headers.get("Cookie");
    const cookie = (await prefs.parse(cookieHeader)) || {};
    return json({
        character: { data: characterData, status: characterStatus },
        posts: { data: postData, status: postStatus },
        userPrefs: { debug: cookie.debug },
    });
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
    return PostLog(loaderData.character.data, loaderData.posts.data, userPrefs, false, [
        loaderData.character.status,
        loaderData.posts.status,
    ]);
}

export function PostLog(
    character: Character,
    posts: Post[],
    userPrefs: Cookie,
    component: boolean,
    statuses: number[]
) {
    // Guard clauses
    statuses.map((status) => {
        if (status === 500) {
            return characterErrMessage("Error getting posts from the server");
        }
    });
    if (posts.length === 0) {
        return characterErrMessage("Oops! Looks like there are no posts to show");
    }
    // process posts
    let processedPosts = posts.map((post) => {
        return {
            ...post,
            timestamp: parseISO(post.timestamp + "Z"),
        };
    });
    processedPosts = processedPosts.sort((a, b) => {
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
                {processedPosts.map((post, index) => {
                    const scheduledPost = post.timestamp > new Date();
                    if (scheduledPost && !userPrefs.debug) {
                        return null;
                    }
                    return (
                        <div key={index}>
                            <div className="flex pb-4  w-full">
                                <img
                                    className="rounded-full w-20 me-8"
                                    src={endpoints.imageURL(character.profile_path)}
                                    alt={post.caption}
                                />
                                <div className="flex flex-col justify-center">
                                    <p>{character.name}</p>
                                    <p className="text-text-muted-dark">
                                        {formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                            <div className="relative">
                                <img
                                    className="rounded-lg"
                                    src={endpoints.imageURL(post.image_path)}
                                    alt={post.caption}
                                />
                                <div className="absolute bottom-0 left-0 w-full h-6 flex ">👍❤️😍🎉</div>
                            </div>
                            <p className="pt-2 px-6" dangerouslySetInnerHTML={{ __html: boldHashtags(post.caption) }} />
                            {index != 0 && <hr className="mx-4 my-6 border-text-muted-dark" />}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function boldHashtags(text: string) {
    return text.replace(/(#\w+)/g, "<strong>$1</strong>");
}
