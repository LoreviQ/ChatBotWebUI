import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { useOutletContext } from "react-router-dom";

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
    const posts = loaderData.posts.data as Post[];
    return (
        <PostLog
            posts={posts}
            userPrefs={userPrefs}
            hideSidebar={false}
            detached={loaderData.detached}
            pad={false}
            border={true}
        />
    );
}
