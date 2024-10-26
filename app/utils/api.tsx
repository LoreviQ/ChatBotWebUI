import axios from "axios";

const API_URL = "https://echoesai.a.pinggy.link/";

const api = axios.create({
    baseURL: API_URL,
});

const endpoints = {
    threadMessages: (thread_id: string) => `/threads/${thread_id}/messages`,
    newMessage: (thread_id: string) => `/threads/${thread_id}/messages/new`,
    message: (message_id: string) => `/messages/${message_id}`,
    characterByPath: (path: string) => `/characters/path/${path}`,
    characterEvents: (char_path: string) => `/events/${char_path}`,
    characterPosts: (char_path: string) => `/posts/${char_path}`,
    imageURL: (image_path: string) => `${API_URL}/images/${image_path}`,
    newCharacter: () => `/characters/new`,
    login: () => `/login`,
    register: () => `/users/new`,
};

export { endpoints, api };
