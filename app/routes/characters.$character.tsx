import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Outlet } from "@remix-run/react";
import { useOutletContext } from "react-router-dom";
import { json } from "@remix-run/node";

import type { Character } from "./characters";
import { api, endpoints } from "../utils/api";

export interface OutletContextFromCharacter {
    character: Character;
    detatched: boolean;
}

interface LoaderData {
    detatched: boolean;
}

export async function loader({ params, request }: LoaderFunctionArgs) {
    const response = await api.get(endpoints.detatched());
    const detatched = (await response.data) === "True";
    return json({
        detatched,
    });
}

export default function CharactersData() {
    const character = useOutletContext<Character>();
    const loaderData = useLoaderData<LoaderData>();
    return (
        <div>
            <Outlet context={{ character, detatched: loaderData.detatched }} />
        </div>
    );
}
