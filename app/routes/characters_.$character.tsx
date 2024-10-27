import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { api, endpoints } from "../utils/api";
import { json } from "@remix-run/node";
import type { Character } from "./characters";
import { CharacterOutlineButton } from "../components/buttons";

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
        characters: { data: characterData, status: characterStatus },
    });
}

export default function CharactersData() {
    const loaderData = useLoaderData<typeof loader>();
    const character = loaderData.characters.data as Character;

    return (
        <div className="mt-20">
            <CharacterDetails character={character} />
        </div>
    );
}

// Renders a character's details
interface CharacterDetailsProps {
    character: Character;
}
function CharacterDetails({ character }: CharacterDetailsProps) {
    return (
        <div className="flex flex-col mx-auto max-w-4xl">
            <div className="px-5 pt-5 flex justify-center space-x-4">
                <Link to={`/characters/${character.path_name}/chat/1`}>
                    <CharacterOutlineButton text="Chat!" />
                </Link>
                <Link to={`/characters/${character.path_name}/posts`}>
                    <CharacterOutlineButton text="Posts!" />
                </Link>
                <Link to={`/characters/${character.path_name}/events`}>
                    <CharacterOutlineButton text="Events!" />
                </Link>
                <Link to={`/characters/${character.path_name}/all`}>
                    <CharacterOutlineButton text="All?" />
                </Link>
            </div>
            <div className="flex items-center">
                <img className="p-5" src={endpoints.imageURL(character.profile_path)} />
                <div className="p-5 flex flex-col text-xl space-y-2">
                    <p>Age: {character.age}</p>
                    <p>Height: {character.height}</p>
                    <p>Loves: {character.loves}</p>
                    <p>Hates: {character.hates}</p>
                    <p>Favorite colour : {character.favorite_colour}</p>
                    {character.phases ? <div>This character has phases</div> : null}
                </div>
            </div>
            <div className="p-5">
                <div>{character.description}</div>
                <div>{character.personality}</div>
                <div>{character.details}</div>
                <div>{character.scenario}</div>
                <div>{character.important}</div>
            </div>
            {character.img_gen ? (
                <div className="p-5">
                    <h1>This character creates images with the following settings:</h1>
                    <p>Model : {character.model}</p>
                    <p>Appearance tags : {character.appearance}</p>
                    <p>Global positive : {character.global_positive}</p>
                    <p>Global negative : {character.global_negative}</p>
                </div>
            ) : null}
        </div>
    );
}
