import { createCookie } from "@remix-run/node";

export const prefs = createCookie("prefs");

export type Cookie = {
    debug: boolean;
    jwt: string;
};
