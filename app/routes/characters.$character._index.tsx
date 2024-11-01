import { Link } from "@remix-run/react";
import { useOutletContext } from "react-router-dom";
import { useState, useRef } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";

import type { Character } from "./characters";
import type { OutletContextFromCharacter } from "./characters.$character";
import { imageURL, endpoints, api, uploadFileToGCS } from "../utils/api";
import { CharacterOutlineButton } from "../components/buttons";

export default function CharactersData() {
    const { userPrefs, character, posts, events, detached } = useOutletContext<OutletContextFromCharacter>();
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
                <Link to={`/characters/${character.path_name}/posts`}>
                    <CharacterOutlineButton text="Posts!" />
                </Link>
                <Link to={`/characters/${character.path_name}/events`}>
                    <CharacterOutlineButton text="Events!" />
                </Link>
                <Link to={`/characters/${character.path_name}/all`}>
                    <CharacterOutlineButton text="All?" />
                </Link>
                <Link to={`/characters/${character.path_name}/chat/`}>
                    <CharacterOutlineButton text="Chat!" />
                </Link>
                <Link to={`/characters/${character.path_name}/chats/new`}>
                    <CharacterOutlineButton text="New Chat!" />
                </Link>
                <Link to={`/characters/${character.path_name}/chats/`}>
                    <CharacterOutlineButton text="Previous chats" />
                </Link>
            </div>
            <div className="flex items-center">
                <ImageBox
                    imageURL={imageURL(character.profile_path)}
                    charName={character.name}
                    charPath={character.path_name}
                />
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

interface ImageBoxProps {
    imageURL: string;
    charName: string;
    charPath: string;
}
function ImageBox({ imageURL, charName, charPath }: ImageBoxProps) {
    const [imageError, setImageError] = useState(true);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    return (
        <div className="p-5 w-80 h-80">
            {imageError ? (
                <div
                    className="w-full h-full flex flex-col justify-center items-center bg-black/30 rounded-3xl"
                    onClick={() => {
                        fileInputRef.current?.click();
                    }}
                    style={{ cursor: "pointer" }}
                >
                    <p>Woops!</p>
                    <p>{charName} doesn't have an image yet!</p>
                    <p>Click here to upload one!</p>
                    <FontAwesomeIcon className="" icon={faImage} />
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        accept="image/*"
                        onChange={(e) => uploadImage(e, charPath)}
                    />
                </div>
            ) : (
                <img className="object-cover" src={imageURL} onError={() => setImageError(true)} />
            )}
        </div>
    );
}

async function uploadImage(event: React.ChangeEvent<HTMLInputElement>, charPath: string) {
    console.log("Uploading image...");
    const file = event.target.files?.[0];
    if (!file) {
        console.error("No file selected");
        return;
    }
    try {
        // Upload file to GCS
        const result = await uploadFileToGCS(file);

        // Prepare payload
        const payload = {
            profile_path: result,
        };

        // Update character profile
        const response = await fetch(endpoints.character(charPath), {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            console.log("File uploaded and character updated successfully");
        } else {
            console.error("Failed to update character profile", response.status);
        }
    } catch (error) {
        console.error("Error uploading file or updating character profile", error);
    }
}
