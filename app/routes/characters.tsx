import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useRevalidator, Link } from "@remix-run/react";
import { api, endpoints } from "../utils/api";
import { json } from "@remix-run/node";
import { useEffect } from "react";

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

export async function loader({}: LoaderFunctionArgs) {
    let characterData: Character[], characterStatus: number;
    try {
        const response = await api.get(endpoints.characters());
        characterData = await response.data;
        characterStatus = response.status;
    } catch (error) {
        characterData = [];
        characterStatus = 500;
    }
    return json({
        characters: { data: characterData, status: characterStatus },
    });
}

export async function action({ request }: ActionFunctionArgs) {
    return;
}

export default function CharactersList() {
    const loaderData = useLoaderData<typeof loader>();
    const characters = loaderData.characters.data as Character[];

    // Revalidate the characters every 10 minutes
    let { revalidate } = useRevalidator();
    useEffect(() => {
        let id = setInterval(revalidate, 600000);
        return () => clearInterval(id);
    }, [revalidate]);

    return (
        <div className="mt-20 flex flex-wrap">
            {characters.map((character, index) => {
                return (
                    <div key={index} className="p-4 w-1/4">
                        <CharacterCard character={character} />
                    </div>
                );
            })}
        </div>
    );
}

interface CharacterCardProps {
    character: Character;
}
export function CharacterCard({ character }: CharacterCardProps) {
    return (
        <Link to={`/characters/${character.path_name}`}>
            <div
                className="
                rounded-lg p-4 h-52 
                bg-black border-2"
                style={{ borderColor: character.favorite_colour }}
            >
                <div className="flex items-center">
                    <img
                        className="rounded-full w-20 me-8 border-2"
                        style={{ borderColor: character.favorite_colour }}
                        src={endpoints.imageURL(character.profile_path)}
                    />
                    <h2 className="text-4xl font-semibold" style={{ color: character.favorite_colour }}>
                        {character.name}
                    </h2>
                </div>
                <p className="ps-4  pt-4">{character.description}</p>
            </div>
        </Link>
    );
}
