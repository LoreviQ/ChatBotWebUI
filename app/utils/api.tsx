import axios from "axios";

const BASEURL = "http://localhost:5000";

const api = axios.create({
    baseURL: BASEURL,
});

const endpoints = {
    threadMessages: (thread_id: string) => `/threads/${thread_id}/messages`,
    newMessage: (thread_id: string) => `/threads/${thread_id}/messages/new`,
    message: (message_id: string) => `/messages/${message_id}`,
    characterByPath: (path: string) => `/characters/path/${path}`,
    characterEvents: (char_path: string) => `/events/${char_path}`,
    characterPosts: (char_path: string) => `/posts/${char_path}`,
    imageURL: (image_path: string) => `${BASEURL}/images/${image_path}`,
    newCharacter: () => `/characters/new`,
};

export { endpoints, api };
