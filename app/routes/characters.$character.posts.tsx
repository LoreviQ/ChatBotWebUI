import { formatDistanceToNow } from "date-fns";
import { useOutletContext } from "react-router-dom";
import { Link } from "@remix-run/react";

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
    posted_by: Character;
    content: string;
    image_post: boolean;
    image_description: string;
    prompt: string;
    image_path: string;
    comments_count: number;
    comments: Comment[];
};

export default function Posts() {
    const { userPrefs, character, posts, events, detached } = useOutletContext<OutletContextFromCharacter>();
    return (
        <div className="container mx-auto max-w-2xl">
            <PostLog
                posts={posts}
                userPrefs={userPrefs}
                hideSidebar={false}
                detached={detached}
                pad={true}
                border={false}
                load={false}
                loaderRef={undefined}
            />
        </div>
    );
}

interface PostLogProps {
    posts: Post[];
    userPrefs: Cookie;
    hideSidebar: boolean;
    detached: boolean;
    pad: boolean;
    border: boolean;
    load: boolean;
    loaderRef: React.RefObject<HTMLDivElement> | undefined;
}

export function PostLog({
    posts,
    userPrefs,
    hideSidebar: component,
    detached,
    pad,
    border,
    load,
    loaderRef,
}: PostLogProps) {
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

    // if load assert types for loaderRef and loading
    if (load) {
        loaderRef = loaderRef as React.RefObject<HTMLDivElement>;
    }

    return (
        <div className="flex flex-col h-screen">
            <div
                className={`overflow-auto flex flex-grow flex-col 
                    ${component ? "hidden-scrollbar" : "custom-scrollbar"}
                `}
            >
                <div className={`${border ? "border-r border-text-muted-dark" : ""}`}>
                    {pad && <div className="h-20 flex-shrink-0" />}
                    {processedPosts.map((post, index) => {
                        const scheduledPost = post.timestamp > new Date();
                        if (scheduledPost && !userPrefs.debug) {
                            return null;
                        }
                        return <Post key={index} post={post} index={index} />;
                    })}
                </div>
                {load && (
                    <div ref={loaderRef}>
                        <LoadingMorePosts />
                    </div>
                )}
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
    index: number;
}
// Renders either an image or text post - with comments
function Post({ post, index }: PostProps) {
    return (
        <div>
            {index != 0 && <hr className="mt-4 border-text-muted-dark" />}
            <UserStamp
                profile_path={post.posted_by.profile_path}
                username={post.posted_by.name}
                path_name={post.posted_by.path_name}
                timestamp={post.timestamp}
            />
            <PostContent className="ps-16 pe-4" text={post.content} />
            {post.image_post && post.image_path && <PostImage image_path={post.image_path} />}
            <CommentLog comments_count={post.comments_count} comments={post.comments} />
        </div>
    );
}

interface CommentLogProps {
    comments_count: number;
    comments: Comment[];
}

function CommentLog({ comments_count, comments }: CommentLogProps) {
    return (
        <div className="ps-8">
            {comments.length > 0
                ? comments.map((comment, index) => <CommentBox key={index} comment={comment} />)
                : null}
        </div>
    );
}

interface CommentProps {
    comment: Comment;
}
// renders a single comment
function CommentBox({ comment }: CommentProps) {
    return (
        <div>
            <UserStamp
                profile_path={comment.posted_by.profile_path}
                username={comment.posted_by.name}
                path_name={comment.posted_by.path_name}
                timestamp={comment.timestamp}
            />
            <PostContent className="ps-16 pe-4" text={comment.content} />
        </div>
    );
}

// Custom formatting for user info
interface UserStampProps {
    profile_path: string;
    username: string;
    path_name: string;
    timestamp: string | Date;
}
function UserStamp({ profile_path, username, path_name, timestamp }: UserStampProps) {
    return (
        <div className="flex pe-2 items-center">
            <img className="rounded-full w-10 h-10 m-4" src={imageURL(profile_path)} />
            <div className="flex h-10 w-full mb-4 items-end space-x-1">
                <Link className="flex space-x-1" to={`/characters/${path_name}`}>
                    <p className="font-bold">{username}</p>
                    <p className="text-text-muted-dark">{`@${path_name}`}</p>
                </Link>
                <p className="text-text-muted-dark">
                    {`· ${formatDistanceToNow(new Date(timestamp), { addSuffix: true })}`}
                </p>
            </div>
        </div>
    );
}

// Custom formatting for post content
interface PostContentProps {
    className?: string;
    text: string;
}
function PostContent({ className, text }: PostContentProps) {
    text = text.replace(/(#\w+)/g, "<strong>$1</strong>");
    text = text.replace(/^"|"$/g, "");
    return <p className={className} dangerouslySetInnerHTML={{ __html: text }} />;
}

// Loading more posts box
function LoadingMorePosts() {
    return (
        <div className="py-2">
            <hr className="pt-2 border-text-muted-dark" />
            <div className="flex justify-center">
                <p>Loading more posts...</p>
            </div>
        </div>
    );
}

interface PostImageProps {
    image_path: string;
}
function PostImage({ image_path }: PostImageProps) {
    return (
        <div className="p-4">
            <div className="relative">
                <img className="rounded-lg" src={imageURL(image_path)} />
                <div className="absolute bottom-0 left-0 w-full h-6 flex ">👍❤️😍🎉</div>
            </div>
        </div>
    );
}
