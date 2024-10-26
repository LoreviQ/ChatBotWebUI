import axios from "axios";

const API_URL = "https://echoesai.a.pinggy.link/";
const API_VERSION = "v1";

const api = axios.create({
    baseURL: API_URL,
});

const endpoints = {
    newThreadMessage: (thread_id: string) => `${API_VERSION}/threads/${thread_id}/message`,
    threadMessages: (thread_id: string) => `${API_VERSION}/threads/${thread_id}/messages`,
    message: (message_id: string) => `${API_VERSION}/messages/${message_id}`,
    characterEvents: (char_path: string, query = "") => `${API_VERSION}/characters/${char_path}/events?${query}`,
    characterPosts: (char_path: string, query = "") => `${API_VERSION}/characters/${char_path}/posts?${query}`,
    imageURL: (image_path: string) => `${API_URL}/${API_VERSION}/images/${image_path}`,
    characters: (query = "") => `${API_VERSION}/characters?${query}`,
    character: (char_path: string) => `${API_VERSION}/characters/${char_path}`,
    login: () => `${API_VERSION}/login`,
    users: () => `${API_VERSION}/users`,
};

export { endpoints, api };
