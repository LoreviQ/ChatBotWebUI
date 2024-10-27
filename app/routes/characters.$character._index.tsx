import { Link } from "@remix-run/react";
import { useOutletContext } from "react-router-dom";

import type { Character } from "./characters";
import { endpoints } from "../utils/api";
import { CharacterOutlineButton } from "../components/buttons";

export default function CharactersData() {
    const [character, detatched] = useOutletContext();
    return <CharacterDetails character={character} />;
}

// Renders a character's details
interface CharacterDetailsProps {
    character: Character;
}
function CharacterDetails({ character }: CharacterDetailsProps) {
    return (
        <div className="flex flex-col mt-20 mx-auto max-w-4xl">
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
