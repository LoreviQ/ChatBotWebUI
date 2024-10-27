import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData, Outlet } from "@remix-run/react";
import { json } from "@remix-run/node";

import type { Character } from "./characters";
import { api, endpoints } from "../utils/api";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
    if (!data) return [{ title: "Echoes AI" }];
    const character = data.character.data as Character;
    return [{ title: `${character.name} - Echoes AI` }];
};

export async function loader({ params }: LoaderFunctionArgs) {
    let characterData: Character, characterStatus: number;
    try {
        const response = await api.get(endpoints.character(params.character!));
        characterData = await response.data;
        characterStatus = response.status;
    } catch (error) {
        characterData = {} as Character;
        characterStatus = 500;
    }
    return json({
        character: { data: characterData, status: characterStatus },
    });
}

export default function CharactersData() {
    const loaderData = useLoaderData<typeof loader>();

    return (
        <div>
            <Outlet />
        </div>
    );
}
