import axios from "axios";

const BASEURL = "http://localhost:5000";

const api = axios.create({
    baseURL: BASEURL,
});

const endpoints = {
    threadMessages: (thread_id: string) => `/threads/${thread_id}/messages`,
    newMessage: (thread_id: string) => `/threads/${thread_id}/messages/new`,
    message: (message_id: string) => `/messages/${message_id}`,
    characterEvents: (character: string) => `/events/${character}`,
    characterPosts: (character: string) => `/posts/${character}`,
    imageURL: (image_path: string) => `${BASEURL}/images/${image_path}`,
};

export { endpoints, api };
