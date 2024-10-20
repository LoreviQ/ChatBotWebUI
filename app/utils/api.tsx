import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5000",
});

const endpoints = {
    threadMessages: (thread_id: string) => `/threads/${thread_id}/messages`,
    newMessage: (thread_id: string) => `/threads/${thread_id}/messages/new`,
    message: (message_id: string) => `/messages/${message_id}`,
};

export { endpoints, api };
