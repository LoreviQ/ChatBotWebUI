import { json } from "@remix-run/node";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, useRouteLoaderData } from "@remix-run/react";
import type { Cookie } from "../utils/cookies";
import { prefs, isJwtExpired } from "../utils/cookies";
import { api, endpoints } from "../utils/api";
import { Character } from "../routes/_app.characters";
import { useState, useEffect } from "react";
import { getConstrastingColour } from "../utils/colours";

import { Header } from "../components/header";

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
        params: params,
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

export default function App() {
    const [primaryColour, setPrimaryColour] = useState("#FFFFFF");
    const [contrastingColour, setContrastingColour] = useState("#000000");
    const [title, setTitle] = useState("Echoes AI");
    const [titleLink, setTitleLink] = useState("/");
    const [userPrefs, setUserPrefs] = useState({ debug: false } as Cookie);
    const [showBackButton, setShowBackButton] = useState(false);
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
        if (loaderData?.params?.character) {
            setShowBackButton(true);
        }
    }, [loaderData]);
    return (
        <div style={{ "--color-primary": primaryColour, "--color-contrast": contrastingColour } as React.CSSProperties}>
            <Header
                title={title}
                userPrefs={userPrefs}
                titleLink={titleLink}
                loggedIn={!!loaderData?.auth.loggedIn}
                showBackButton={showBackButton}
            />
            <Outlet />
        </div>
    );
}
