import type { ActionFunctionArgs } from "@remix-run/node";
import { prefs } from "./../utils/cookies";
import { json } from "@remix-run/node";

export async function action({ request }: ActionFunctionArgs) {
    const cookieHeader = request.headers.get("Cookie");
    const cookie = (await prefs.parse(cookieHeader)) || {};
    cookie.jwt = "";
    return json(null, {
        headers: {
            "Set-Cookie": await prefs.serialize(cookie),
        },
    });
}
