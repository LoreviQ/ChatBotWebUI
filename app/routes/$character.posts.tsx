import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useRevalidator } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";
import { parseISO, formatDistanceToNow } from "date-fns";
import { useEffect } from "react";

import type { Cookie } from "./../utils/cookies";
import { prefs } from "./../utils/cookies";
import { api, endpoints } from "../utils/api";

type PostResponse = {
    data: Post[];
    status: number;
};

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
    let responseData: Post[], status: number;
    try {
        const response = await api.get(endpoints.characterPosts(params.character!));
        responseData = await response.data;
        status = response.status;
    } catch (error) {
        responseData = [];
        status = 500;
    }
    const cookieHeader = request.headers.get("Cookie");
    const cookie = (await prefs.parse(cookieHeader)) || {};
    return json({ posts: { data: responseData, status: status }, userPrefs: { debug: cookie.debug } });
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

    return PostLog(loaderData.posts, userPrefs, false);
}

export function PostLog(PostResponse: PostResponse, userPrefs: Cookie, component: boolean) {
    // process posts
    let posts = PostResponse.data.map((post) => {
        return {
            ...post,
            timestamp: parseISO(post.timestamp + "Z"),
        };
    });
    posts = posts.sort((a, b) => {
        const timeDifference = b.timestamp.getTime() - a.timestamp.getTime();
        if (timeDifference !== 0) {
            return timeDifference;
        }
        return b.id - a.id;
    });
    return (
        <div className="flex flex-col h-screen">
            <div
                className={`overflow-auto flex flex-grow flex-col-reverse ${
                    component ? "hidden-scrollbar" : "custom-scrollbar"
                }`}
            >
                {posts.length > 0 ? (
                    posts.map((post, index) => {
                        const scheduledPost = post.timestamp > new Date();
                        if (scheduledPost && !userPrefs.debug) {
                            return null;
                        }
                        return (
                            <div key={index}>
                                <div className="flex py-2 w-full">
                                    <p>Ophelia</p>
                                    <p className="px-4">•</p>
                                    <div className="flex items-end">
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
                                <p
                                    className="py-2 px-6"
                                    dangerouslySetInnerHTML={{ __html: boldHashtags(post.caption) }}
                                />
                                {index != 0 && <hr />}
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center text-text-muted-dark my-4">
                        {PostResponse.status === 500
                            ? "Error getting posts from the server"
                            : "Oops! Looks like there are no posts to show"}
                    </div>
                )}
            </div>
        </div>
    );
}

function boldHashtags(text: string) {
    return text.replace(/(#\w+)/g, "<strong>$1</strong>");
}
