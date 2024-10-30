import axios from "axios";

const API_VERSION = "v1";

export function api() {
    return axios.create({
        baseURL: process.env.API_URL,
    });
}

export const endpoints = {
    threads: (query = "") => `${API_VERSION}/threads?${query}`,
    newThreadMessage: (thread_id: string) => `${API_VERSION}/threads/${thread_id}/message`,
    threadMessages: (thread_id: string) => `${API_VERSION}/threads/${thread_id}/messages`,
    message: (message_id: string, query = "") => `${API_VERSION}/messages/${message_id}?${query}`,
    characterEvents: (char_path: string, query = "") => `${API_VERSION}/characters/${char_path}/events?${query}`,
    characterPosts: (char_path: string, query = "") => `${API_VERSION}/characters/${char_path}/posts?${query}`,
    characters: (query = "") => `${API_VERSION}/characters?${query}`,
    character: (char_path: string) => `${API_VERSION}/characters/${char_path}`,
    login: () => `${API_VERSION}/login`,
    users: () => `${API_VERSION}/users`,
    readiness: () => `${API_VERSION}/readiness`,
    detached: () => `${API_VERSION}/detached`,
};

export function imageURL(path: string) {
    return `https://storage.googleapis.com/echoesai-public-images/${path}`;
}
