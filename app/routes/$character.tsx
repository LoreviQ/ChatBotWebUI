import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { prefs } from "./../utils/cookies";
import { useLoaderData, useFetcher, Outlet } from "@remix-run/react";

export async function loader({ params, request }: LoaderFunctionArgs) {
    const cookieHeader = request.headers.get("Cookie");
    const cookie = (await prefs.parse(cookieHeader)) || {};
    return json({ userPrefs: { debug: cookie.debug } });
}

export async function action({ request }: ActionFunctionArgs) {
    const cookieHeader = request.headers.get("Cookie");
    const cookie = (await prefs.parse(cookieHeader)) || {};
    const formData = await request.formData();

    const debug = formData.get("sidebar") === "open";
    cookie.debug = debug;

    return json(debug, {
        headers: {
            "Set-Cookie": await prefs.serialize(cookie),
        },
    });
}

export default function Header() {
    const fetcher = useFetcher();
    const data = useLoaderData();
    return (
        <div>
            <div
                className="
                absolute top-0 left-0 w-full h-20 flex items-start
                backdrop-blur-sm backdrop-saturate-200 backdrop-contrast-150 bg-bg-dark/50 
                border-double border-b-4 border-primary-dark
            "
            >
                <fetcher.Form method="post">
                    <label className="inline-flex items-center cursor-pointer">
                        <input type="checkbox" value="" className="sr-only peer" />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Debug</span>
                    </label>
                </fetcher.Form>
            </div>
            <Outlet />
        </div>
    );
}
