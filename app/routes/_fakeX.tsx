import type { LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";

import type { Cookie } from "../utils/cookies";
import { prefs, isJwtExpired } from "../utils/cookies";
import { Sidebar, SearchBar } from "../components/sidebars";

export async function loader({ params, request }: LoaderFunctionArgs) {
    const cookieHeader = request.headers.get("Cookie");
    const cookie = (await prefs.parse(cookieHeader)) || {};
    let loggedIn = !!cookie.jwt && !isJwtExpired(cookie.jwt);
    return json({
        userPrefs: { debug: cookie.debug },
        auth: { loggedIn: loggedIn },
        params: params,
    });
}

export default function FakeX() {
    const loaderData = useLoaderData<typeof loader>();
    const userPrefs = loaderData.userPrefs as Cookie;
    return (
        <div className="flex">
            <div className="w-1/3">
                <Sidebar userPrefs={userPrefs} loggedIn={loaderData.auth.loggedIn} />
            </div>
            <div className="w-1/3">
                <Outlet context={userPrefs} />
            </div>
            <div className="w-1/3">
                <SearchBar userPrefs={userPrefs} loggedIn={loaderData.auth.loggedIn} />
            </div>
        </div>
    );
}
