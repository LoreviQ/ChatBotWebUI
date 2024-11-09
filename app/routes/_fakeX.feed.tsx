import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { useOutletContext } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

import type { Cookie } from "../utils/cookies";
import type { Post } from "./characters.$character.posts";
import { PostLog } from "./characters.$character.posts";
import { api, endpoints } from "../utils/api";

export async function loader() {
    let postData: Post[], postStatus: number;
    try {
        const query = `limit=10&orderby=timestamp&order=desc`;
        const response = await api().get(endpoints.posts(query));
        postData = await response.data;
        postStatus = response.status;
    } catch (error) {
        postData = [];
        postStatus = 500;
    }
    const response = await api().get(endpoints.detached());
    const detached = (await response.data) === "True";
    return json({
        posts: { data: postData, status: postStatus },
        detached,
    });
}

export default function feed() {
    const userPrefs = useOutletContext<Cookie>();
    const loaderData = useLoaderData<typeof loader>();
    const [posts, setPosts] = useState<Post[]>(loaderData.posts.data ?? []);
    const [loading, setLoading] = useState(false);
    const [offset, setOffset] = useState(0);
    const loaderRef = useRef(null);

    useEffect(() => {
        const currentLoaderRef = loaderRef.current;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loading) {
                    setLoading(true);
                    fetchMorePosts(offset).catch((error) => {
                        console.error("Error in infinite scroll:", error);
                        setLoading(false);
                    });
                }
            },
            {
                threshold: 0,
                rootMargin: "100px 0px",
            }
        );
        if (currentLoaderRef) {
            observer.observe(currentLoaderRef);
        }
        return () => {
            if (currentLoaderRef) {
                observer.unobserve(currentLoaderRef);
            }
            observer.disconnect();
        };
    }, [loading, offset]);

    const fetchMorePosts = async (currentOffset: number) => {
        try {
            const newOffset = currentOffset + 10;
            const query = `limit=10&offset=${newOffset}&orderby=timestamp&order=desc`;
            const response = await api().get(endpoints.posts(query));
            const newPosts = await response.data;
            if (newPosts.length > 0) {
                setPosts((prevPosts) => [...prevPosts, ...newPosts]);
                setOffset(newOffset);
            }
            setLoading(false);
        } catch (error) {
            console.error("Error fetching posts", error);
            setLoading(false);
        }
    };

    return (
        <>
            <PostLog
                posts={posts}
                userPrefs={userPrefs}
                hideSidebar={false}
                detached={loaderData.detached}
                pad={false}
                border={true}
                load={true}
                loaderRef={loaderRef}
            />
        </>
    );
}
