import { json } from "@remix-run/node";
import type { ActionFunctionArgs, LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import {
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    useRouteError,
    isRouteErrorResponse,
    useRouteLoaderData,
    useFetcher,
    useSubmit,
    Link,
} from "@remix-run/react";
import type { Cookie } from "./utils/cookies";
import { prefs, isJwtExpired } from "./utils/cookies";
import { api, endpoints } from "./utils/api";
import { Character } from "./routes/characters";
import { useState, useEffect } from "react";
import { getConstrastingColour } from "./utils/colours";

import "./tailwind.css";
import "./styles.css";

export const links: LinksFunction = () => [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
    },
    {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
    },
];

export function ErrorBoundary() {
    const error = useRouteError();
    return (
        <div className="flex w-full h-screen items-center justify-center">
            <div className="p-10 bg-contrast border-2 text-character border-character rounded-lg">
                <h1>
                    {isRouteErrorResponse(error)
                        ? `${error.status} ${error.statusText}`
                        : error instanceof Error
                        ? error.message
                        : "Unknown Error"}
                </h1>
            </div>
        </div>
    );
}

export async function loader({ params, request }: LoaderFunctionArgs) {
    let characterData: Character, characterStatus: number;
    if (params?.character) {
        try {
            const response = await api.get(endpoints.character(params.character!));
            characterData = await response.data;
            characterStatus = response.status;
        } catch (error) {
            characterData = {} as Character;
            characterStatus = 500;
        }
    } else {
        characterData = {} as Character;
        characterStatus = 404;
    }
    const cookieHeader = request.headers.get("Cookie");
    const cookie = (await prefs.parse(cookieHeader)) || {};
    let loggedIn = !!cookie.jwt && !isJwtExpired(cookie.jwt);
    return json({
        character: { data: characterData, status: characterStatus },
        userPrefs: { debug: cookie.debug },
        auth: { loggedIn: loggedIn },
    });
}

export async function action({ request }: ActionFunctionArgs) {
    const cookieHeader = request.headers.get("Cookie");
    const cookie = (await prefs.parse(cookieHeader)) || {};
    const formData = await request.formData();
    let debug: boolean = false;
    if (formData.has("debug")) {
        debug = true;
    }
    cookie.debug = debug;
    return json(debug, {
        headers: {
            "Set-Cookie": await prefs.serialize(cookie),
        },
    });
}

export function Layout({ children }: { children: React.ReactNode }) {
    const [primaryColour, setPrimaryColour] = useState("#FFFFFF");
    const [contrastingColour, setContrastingColour] = useState("#000000");
    const [title, setTitle] = useState("Echoes AI");
    const [titleLink, setTitleLink] = useState("/");
    const [userPrefs, setUserPrefs] = useState({ debug: false } as Cookie);
    // Modify state based on character data
    const loaderData = useRouteLoaderData<typeof loader>("root");
    useEffect(() => {
        if (!loaderData) {
            return;
        }
        if (loaderData.character.data.favorite_colour) {
            setPrimaryColour(loaderData.character.data.favorite_colour);
            setContrastingColour(getConstrastingColour(loaderData.character.data.favorite_colour));
        }
        if (loaderData.character.data.name) {
            setTitle(loaderData.character.data.name);
        }
        if (loaderData.character.data.path_name) {
            setTitleLink(`/characters/${loaderData.character.data.path_name}`);
        }
        if (loaderData.userPrefs) {
            const prefs = loaderData.userPrefs as Cookie;
            setUserPrefs(prefs);
        }
    }, [loaderData]);
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <Meta />
                <Links />
            </head>
            <body
                style={
                    { "--color-primary": primaryColour, "--color-contrast": contrastingColour } as React.CSSProperties
                }
            >
                <Header
                    title={title}
                    userPrefs={userPrefs}
                    titleLink={titleLink}
                    loggedIn={!!loaderData?.auth.loggedIn}
                />
                {children}
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}

export default function App() {
    return (
        <div>
            <Outlet />
        </div>
    );
}

// Rendrs the header of the page
interface headerProps {
    title: string;
    userPrefs: Cookie;
    titleLink: string;
    loggedIn: boolean;
}
function Header({ title, userPrefs, titleLink, loggedIn }: headerProps) {
    const fetcher = useFetcher();
    const submit = useSubmit();
    return (
        <div>
            <div
                className="
                    absolute top-0 left-0 w-full h-20 flex items-center
                    backdrop-blur-sm backdrop-saturate-200 backdrop-contrast-150 bg-bg-dark/50 
                    border-b-4 border-character
                    z-40
                "
            >
                <div className="p-4 flex justify-between w-full">
                    <fetcher.Form
                        className="flex"
                        onChange={(e) => {
                            submit(e.currentTarget, { method: "post", navigate: false });
                        }}
                    >
                        <label className="items-center inline-flex cursor-pointer">
                            <input
                                name="debug"
                                type="checkbox"
                                value={1}
                                className="sr-only peer"
                                defaultChecked={userPrefs.debug}
                            />
                            <div
                                className="
                                relative w-11 h-6 rounded-full
                                bg-hover-dark
                                peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full  peer-checked:bg-character
                                after:content-[''] after:absolute after:top-[2px] after:start-[2px] 
                                after:border after:border-hover-dark peer-checked:after:border-white after:bg-white 
                                after:rounded-full after:h-5 after:w-5 after:transition-all  
                            "
                            ></div>
                            <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Debug</span>
                        </label>
                    </fetcher.Form>
                    {loggedIn ? (
                        <fetcher.Form method="post" action="/logout">
                            <button
                                className="py-2 px-4 border rounded font-semibold
                    bg-transparent  text-character border-character
                    hover:bg-character hover:text-contrast hover:border-transparent"
                            >
                                Logout
                            </button>
                        </fetcher.Form>
                    ) : (
                        <Link to="/login">
                            <button
                                className="py-2 px-4 border rounded font-semibold
                        bg-transparent  text-character border-character
                        hover:bg-character hover:text-contrast hover:border-transparent"
                            >
                                Login
                            </button>
                        </Link>
                    )}
                </div>
                <Link
                    to={titleLink}
                    className="absolute z-40 left-1/2 transform -translate-x-1/2 text-5xl font-ophelia font-outline"
                >
                    <button className="" type="button">
                        {title}
                    </button>
                </Link>
            </div>
        </div>
    );
}

function HeaderModel() {
    return (
        <div>
            <div
                className={`
                        flex text-xl justify-between absolute z-50 left-1/2 
                        transform -translate-x-1/2 p-2 rounded-lg bg-bg-dark 
                        border-2 border-t-4 border-character
                        `}
                style={{ top: "76px" }}
            >
                <button className="px-4 mx-2 py-2">Events</button>
                <button className="px-4 mx-2 py-2">Chat</button>
                <button className="px-4 mx-2 py-2">Posts</button>
            </div>
        </div>
    );
}
