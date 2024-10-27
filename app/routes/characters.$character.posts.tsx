import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useRevalidator } from "@remix-run/react";
import { parseISO, formatDistanceToNow } from "date-fns";
import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";

import type { Cookie } from "../utils/cookies";
import { prefs } from "../utils/cookies";
import { api, endpoints } from "../utils/api";
import type { Character } from "./characters";
import { characterErrMessage } from "../utils/errors";
import { WarningDualText } from "../components/warnings";

export type Post = {
    id: number;
    timestamp: string | Date;
    image_post: boolean;
    description: string;
    prompt: string;
    caption: string;
    image_path: string;
};

export async function loader({ params, request }: LoaderFunctionArgs) {
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
        posts: { data: postData, status: postStatus },
        userPrefs: { debug: cookie.debug },
    });
}

export default function Posts() {
    const loaderData = useLoaderData<typeof loader>();
    const [character, detatched] = useOutletContext();
    const posts = loaderData.posts.data as Post[];
    const userPrefs = loaderData.userPrefs as Cookie;
    const statuses = [loaderData.posts.status];

    // Revalidate the posts every minute
    let { revalidate } = useRevalidator();
    useEffect(() => {
        let id = setInterval(revalidate, 60000);
        return () => clearInterval(id);
    }, [revalidate]);
    return (
        <div className="container mx-auto max-w-2xl">
            <PostLog
                character={character}
                posts={posts}
                userPrefs={userPrefs}
                component={false}
                statuses={statuses}
                detatched={detatched}
            />
        </div>
    );
}

interface PostLogProps {
    character: Character;
    posts: Post[];
    userPrefs: Cookie;
    component: boolean;
    statuses: number[];
    detatched: boolean;
}

export function PostLog({ character, posts, userPrefs, component, statuses, detatched }: PostLogProps) {
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
                className={`overflow-auto flex flex-grow flex-col-reverse pt-20  ${
                    component ? "hidden-scrollbar" : "custom-scrollbar"
                }`}
            >
                {processedPosts.map((post, index) => {
                    const scheduledPost = post.timestamp > new Date();
                    if (scheduledPost && !userPrefs.debug) {
                        return null;
                    }
                    if (post.image_post) {
                        if (post.image_path) {
                            return <ImagePost key={index} post={post} character={character} index={index} />;
                        }
                        return null;
                    }
                    return <TextPost key={index} post={post} character={character} index={index} />;
                })}
            </div>
            {detatched && (
                <WarningDualText
                    text1="The API is running in detatched mode."
                    text2="New posts will not be generated."
                />
            )}
        </div>
    );
}

interface postProps {
    post: Post;
    character: Character;
    index: number;
}

// Renders an image post
function ImagePost({ post, character, index }: postProps) {
    return (
        <div className="px-4">
            <div className="flex pb-4 w-full">
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
                <img className="rounded-lg" src={endpoints.imageURL(post.image_path)} alt={post.caption} />
                <div className="absolute bottom-0 left-0 w-full h-6 flex ">👍❤️😍🎉</div>
            </div>
            <p className="pt-2 px-6" dangerouslySetInnerHTML={{ __html: formatPost(post.caption) }} />
            {index != 0 && <hr className="mx-4 my-6 border-text-muted-dark" />}
        </div>
    );
}

// Renders a text post
function TextPost({ post, character, index }: postProps) {
    return (
        <div key={index} className="px-4">
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
            <p className="pt-2 px-6" dangerouslySetInnerHTML={{ __html: formatPost(post.description) }} />
            {index != 0 && <hr className="mx-4 my-6 border-text-muted-dark" />}
        </div>
    );
}

// Custom formatting for post content
function formatPost(text: string) {
    text = text.replace(/(#\w+)/g, "<strong>$1</strong>");
    text = text.replace(/^"|"$/g, "");
    return text;
}
