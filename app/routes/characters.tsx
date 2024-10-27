import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { useState, useEffect } from "react";

import type { Cookie } from "../utils/cookies";
import { prefs, isJwtExpired } from "../utils/cookies";
import { api, endpoints } from "../utils/api";
import { getConstrastingColour } from "../utils/colours";
import { Header } from "../components/header";
import type { ShouldRevalidateFunction } from "@remix-run/react";

export type Character = {
    id: number;
    name: string;
    path_name: string;
    description: string;
    age: number;
    height: string;
    personality: string;
    appearance: string;
    loves: string;
    hates: string;
    details: string;
    scenario: string;
    important: string;
    initial_message: string;
    favorite_colour: string;
    phases: boolean;
    img_gen: boolean;
    model: string;
    global_positive: string;
    global_negative: string;
    profile_path: string;
};

export const meta: MetaFunction = () => {
    return [{ title: "Characters - Echoes AI" }];
};

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

export const shouldRevalidate: ShouldRevalidateFunction = ({ currentParams, nextParams, defaultShouldRevalidate }) => {
    const currentCharacter = currentParams.character;
    const nextCharacter = nextParams.character;
    if (currentCharacter !== nextCharacter) return true;
    return defaultShouldRevalidate;
};

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

export default function CharacterAdjustingHeader() {
    const [primaryColour, setPrimaryColour] = useState("#FFFFFF");
    const [contrastingColour, setContrastingColour] = useState("#000000");
    const [title, setTitle] = useState("Echoes AI");
    const [titleLink, setTitleLink] = useState("/characters");
    const [showBackButton, setShowBackButton] = useState(false);
    // Modify state based on character data
    const loaderData = useLoaderData<typeof loader>();
    const character = loaderData.character.data as Character;
    const userPrefs = loaderData.userPrefs as Cookie;
    useEffect(() => {
        if (loaderData.character.data.favorite_colour) {
            setPrimaryColour(loaderData.character.data.favorite_colour);
            setContrastingColour(getConstrastingColour(loaderData.character.data.favorite_colour));
        } else {
            setPrimaryColour("#FFFFFF");
            setContrastingColour("#000000");
        }
        if (loaderData.character.data.name) {
            setTitle(loaderData.character.data.name);
        } else {
            setTitle("Echoes AI");
        }
        if (loaderData.character.data.path_name) {
            setTitleLink(`/characters/${loaderData.character.data.path_name}`);
        } else {
            setTitleLink("/characters");
        }
        if (loaderData?.params?.character) {
            setShowBackButton(true);
        } else {
            setShowBackButton(false);
        }
    }, [character]);
    return (
        <div style={{ "--color-primary": primaryColour, "--color-contrast": contrastingColour } as React.CSSProperties}>
            <Header
                userPrefs={userPrefs}
                title={title}
                titleLink={titleLink}
                loggedIn={!!loaderData?.auth.loggedIn}
                showBackButton={showBackButton}
            />
            <Outlet />
        </div>
    );
}
