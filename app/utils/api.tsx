import axios from "axios";
import { prefs } from "./cookies";

export const API_VERSION = "v1";

const getApiUrl = () => {
    if (typeof window !== "undefined" && window.ENV && window.ENV.API_URL) {
        return window.ENV.API_URL;
    }
    return process.env.API_URL || "http://localhost:5000";
};

export const api = axios.create({
    baseURL: getApiUrl(),
});

/*
api.interceptors.request.use(
    async (config) => {
        // Only run in browser environment where cookies are available
        if (typeof window !== "undefined") {
            const cookie = await prefs.parse(document.cookie);
            if (cookie?.jwt) {
                config.headers.Authorization = `Bearer ${cookie.jwt}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
*/
export const endpoints = {
    threads: (query = "") => `${API_VERSION}/threads?${query}`,
    usersThreads: (username: string, query = "") => `${API_VERSION}/users/${username}/threads?${query}`,
    newThreadMessage: (thread_id: string) => `${API_VERSION}/threads/${thread_id}/message`,
    threadMessages: (thread_id: string) => `${API_VERSION}/threads/${thread_id}/messages`,
    message: (message_id: string, query = "") => `${API_VERSION}/messages/${message_id}?${query}`,
    characterEvents: (char_path: string, query = "") => `${API_VERSION}/characters/${char_path}/events?${query}`,
    characterPosts: (char_path: string, query = "") => `${API_VERSION}/characters/${char_path}/posts?${query}`,
    characters: (query = "") => `${API_VERSION}/characters?${query}`,
    character: (char_path: string) => `${API_VERSION}/characters/${char_path}`,
    posts: (query = "") => `${API_VERSION}/posts?${query}`,
    postComments: (post_id: string) => `${API_VERSION}/posts/${post_id}/comments`,
    login: () => `${API_VERSION}/login`,
    users: () => `${API_VERSION}/users`,
    readiness: () => `${API_VERSION}/readiness`,
    detached: () => `${API_VERSION}/detached`,
    gcs_signed_url: () => `${API_VERSION}/get-signed-url`,
};

export function imageURL(path: string) {
    return `https://storage.googleapis.com/echoesai-public-images/${path}`;
}

export async function uploadFileToGCS(file: File) {
    const { data, status } = await api.post(endpoints.gcs_signed_url(), {
        file_name: file.name,
        file_type: file.type,
    });
    if (status !== 200) {
        throw new Error("Failed to upload file to GCS");
    }
    console.log("Signed URL:", data);
    const signedUrl = data;
    const response = await fetch(signedUrl, {
        method: "PUT",
        body: file,
        headers: {
            "Content-Type": file.type,
        },
    });
    if (response.ok) {
        return signedUrl.split("?")[0];
    }
    throw new Error("Failed to upload file to GCS");
}
