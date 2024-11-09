import { formatDistanceToNow } from "date-fns";
import { useOutletContext } from "react-router-dom";

import type { Cookie } from "../utils/cookies";
import type { Character } from "./characters";
import type { OutletContextFromCharacter } from "./characters.$character";
import { imageURL } from "../utils/api";
import { characterErrMessage } from "../utils/errors";
import { WarningDualText } from "../components/warnings";

export type Comment = {
    id: number;
    timestamp: string | Date;
    content: string;
    posted_by: Character;
};

export type Post = {
    id: number;
    timestamp: string | Date;
    content: string;
    image_post: boolean;
    image_description: string;
    prompt: string;
    image_path: string;
    comments: Comment[];
};

export default function Posts() {
    const { userPrefs, character, posts, events, detached } = useOutletContext<OutletContextFromCharacter>();
    return (
        <div className="container mx-auto max-w-2xl">
            <PostLog character={character} posts={posts} userPrefs={userPrefs} component={false} detached={detached} />
        </div>
    );
}

interface PostLogProps {
    character: Character;
    posts: Post[];
    userPrefs: Cookie;
    component: boolean;
    detached: boolean;
}

export function PostLog({ character, posts, userPrefs, component, detached }: PostLogProps) {
    if (posts.length === 0) {
        return characterErrMessage("Oops! Looks like there are no posts to show");
    }
    // process posts
    let processedPosts = posts.map((post) => {
        return {
            ...post,
            timestamp: new Date(post.timestamp),
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
                    return <PostManager key={index} post={post} character={character} index={index} />;
                })}
            </div>
            {detached && (
                <WarningDualText
                    text1="The API is running in detached mode."
                    text2="New posts will not be generated."
                />
            )}
        </div>
    );
}

interface PostProps {
    post: Post;
    character: Character;
    index: number;
}
// Renders either an image or text post - with comments
function PostManager({ post, character, index }: PostProps) {
    return (
        <div className="space-y-2">
            {post.image_post && post.image_path ? <ImagePost post={post} character={character} index={index} /> : null}
            {post.image_post ? null : <TextPost post={post} character={character} index={index} />}
            {post.comments.length > 0
                ? post.comments.map((comment, index) => <CommentBox key={index} comment={comment} />)
                : null}
            {index != 0 && <hr className="mx-4 my-6 border-text-muted-dark" />}
        </div>
    );
}

// Renders an image post
function ImagePost({ post, character, index }: PostProps) {
    return (
        <div className="px-4">
            <div className="flex pb-4 w-full">
                <img className="rounded-full w-20 me-8" src={imageURL(character.profile_path)} />
                <div className="flex flex-col justify-center">
                    <p className="font-bold">{character.name}</p>
                    <p className="text-text-muted-dark">
                        {formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })}
                    </p>
                </div>
            </div>
            <div className="relative">
                <img className="rounded-lg" src={imageURL(post.image_path)} />
                <div className="absolute bottom-0 left-0 w-full h-6 flex ">👍❤️😍🎉</div>
            </div>
            <p className="pt-2 px-6" dangerouslySetInnerHTML={{ __html: formatPost(post.content) }} />
        </div>
    );
}

// Renders a text post
function TextPost({ post, character, index }: PostProps) {
    return (
        <div className="px-4">
            <div className="flex pb-4  w-full">
                <img className="rounded-full w-20 h-20 me-8" src={imageURL(character.profile_path)} />
                <div className="flex flex-col justify-center">
                    <p className="font-bold">{character.name}</p>
                    <p className="text-text-muted-dark">
                        {formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })}
                    </p>
                </div>
            </div>
            <p className="pt-2 px-6" dangerouslySetInnerHTML={{ __html: formatPost(post.content) }} />
        </div>
    );
}

interface CommentProps {
    comment: Comment;
}
// renders a single comment
function CommentBox({ comment }: CommentProps) {
    return (
        <div className="flex pb-4 px-2 w-full">
            <img className="rounded-full w-10 h-10 me-4" src={imageURL(comment.posted_by.profile_path)} />
            <div className="flex flex-col justify-center">
                <div className="flex space-x-2">
                    <p className="font-bold">{comment.posted_by.name}</p>
                    <p className="text-text-muted-dark">
                        {formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}
                    </p>
                </div>
                <p className="pt-2 px-4" dangerouslySetInnerHTML={{ __html: formatPost(comment.content) }} />
            </div>
        </div>
    );
}

// Custom formatting for post content
function formatPost(text: string) {
    text = text.replace(/(#\w+)/g, "<strong>$1</strong>");
    text = text.replace(/^"|"$/g, "");
    return text;
}
