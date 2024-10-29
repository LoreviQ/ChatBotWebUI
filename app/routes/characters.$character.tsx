import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Outlet } from "@remix-run/react";
import { useOutletContext } from "react-router-dom";
import { json } from "@remix-run/node";

import type { Character } from "./characters";
import { api, endpoints } from "../utils/api";

export interface OutletContextFromCharacter {
    character: Character;
    detached: boolean;
}

interface LoaderData {
    detached: boolean;
}

export async function loader({ params, request }: LoaderFunctionArgs) {
    const response = await api().get(endpoints.detached());
    const detached = (await response.data) === "True";
    return json({
        detached,
    });
}

export default function CharactersData() {
    const character = useOutletContext<Character>();
    const loaderData = useLoaderData<LoaderData>();
    return (
        <div>
            <Outlet context={{ character, detached: loaderData.detached }} />
        </div>
    );
}
