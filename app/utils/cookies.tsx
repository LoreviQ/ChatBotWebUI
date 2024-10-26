import { createCookie } from "@remix-run/node";
import jwt from "jsonwebtoken";

export const prefs = createCookie("prefs");

export type Cookie = {
    debug: boolean;
    jwt: string;
};

export function isJwtExpired(token: string): boolean {
    try {
        const decoded = jwt.decode(token) as { exp: number };
        if (!decoded || !decoded.exp) {
            return true; // If there's no exp claim, consider it expired
        }
        const currentTime = Math.floor(Date.now() / 1000);
        return decoded.exp < currentTime;
    } catch (error) {
        return true; // If there's an error decoding, consider it expired
    }
}
