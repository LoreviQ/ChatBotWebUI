import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { api, endpoints } from "../utils/api";
import { json } from "@remix-run/node";
import type { Character } from "./characters";

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

export default function CharactersList() {
    const loaderData = useLoaderData<typeof loader>();
    const characters = loaderData.characters.data as Character[];

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

// Render a character card
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
