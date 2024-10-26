import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { prefs } from "./../utils/cookies";
import { useLoaderData, Form, redirect } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";
import type { Cookie } from "./../utils/cookies";
import { api, endpoints } from "../utils/api";
import { useEffect, useState } from "react";

export const meta: MetaFunction = () => {
    return [{ title: "New character" }, { name: "description", content: "Create a new character" }];
};

export async function loader({ params, request }: LoaderFunctionArgs) {
    const cookieHeader = request.headers.get("Cookie");
    const cookie = (await prefs.parse(cookieHeader)) || {};
    return json({
        userPrefs: { debug: cookie.debug },
        params: params,
    });
}

export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData();
    const payload = {
        name: formData.get("character_name"),
        path_name: formData.get("path_name"),
        description: formData.get("description"),
        age: formData.get("age"),
        height: formData.get("height"),
        personality: formData.get("personality"),
        appearance: formData.get("appearance"),
        loves: formData.get("loves"),
        hates: formData.get("hates"),
        details: formData.get("details"),
        scenario: formData.get("scenario"),
        important: formData.get("important"),
        initial_message: formData.get("initial_message"),
        favorite_colour: formData.get("fave_colour"),
        img_gen: formData.get("imgGen"),
        model: formData.get("model"),
        global_positive: formData.get("global_positive"),
        global_negative: formData.get("global_negative"),
    };
    const response = await api.post(endpoints.characters(), payload);
    if (response.status === 200) {
        return redirect(`/${response.data}`);
    }
}

export default function Character() {
    const loaderData = useLoaderData<typeof loader>();
    const userPrefs = loaderData.userPrefs as Cookie;

    return <div>{NewCharacterForm(userPrefs)}</div>;
}

function NewCharacterForm(userPrefs: Cookie) {
    const [imgGen, setImgGen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);
    const imagePlaceholder =
        "small, cuboid, single eye,\nGlobally aplied to all generated images of this character for consistency";
    const gpPlaceholder = "score_9, score_8_up, score_7_up, realistic, etc...\nModel dependent";
    return (
        <div className="container mx-auto max-w-2xl">
            <Form action="/new" method="POST">
                <p className="flex text-2xl justify-center mb-4">Character Details</p>
                <div className="grid grid-cols-4 gap-4 mb-5">
                    <label className="text-text-dark flex items-center justify-end">Name</label>
                    <input
                        type="text"
                        name="character_name"
                        className="text-sm rounded-lg p-2.5 col-span-3
                        bg-bg-dark border border-text-muted-dark text-text-dark "
                        placeholder="Character name"
                        required
                    />
                </div>
                <div className="grid grid-cols-4 gap-4 mb-5">
                    <div>
                        <label className="text-text-dark flex items-center justify-end">Path name</label>
                        <small className="text-xs flex items-center justify-end text-text-muted-dark">
                            Appears in URL
                        </small>
                    </div>
                    <input
                        type="text"
                        name="path_name"
                        className="text-sm rounded-lg p-2.5 col-span-3
                        bg-bg-dark border border-text-muted-dark text-text-dark"
                        placeholder="character-name"
                        required
                    />
                </div>
                {isMounted && (
                    <div className="grid grid-cols-4 gap-4 mb-5">
                        <div>
                            <label className="text-text-dark flex items-center justify-end">Favorite Colour</label>
                        </div>
                        <input
                            type="color"
                            name="fave_colour"
                            className="p-1 h-10 w-14 block bg-white border border-gray-200 cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700"
                            defaultValue="#FF0000"
                        />
                    </div>
                )}
                <div className="grid grid-cols-4 gap-4 mb-5">
                    <label className="text-text-dark flex items-center justify-end">Description</label>
                    <textarea
                        name="description"
                        rows={4}
                        className="text-sm rounded-lg p-2.5 col-span-3
                        bg-bg-dark border border-text-muted-dark text-text-dark"
                        placeholder="Character is an artificial intelligence..."
                    />
                </div>
                <div className="grid grid-cols-4 gap-4 mb-5">
                    <label className="text-text-dark flex items-center justify-end">Age</label>
                    <input
                        type="number"
                        name="age"
                        className="text-sm rounded-lg p-2.5 col-span-3
                        bg-bg-dark border border-text-muted-dark text-text-dark"
                    />
                </div>
                <div className="grid grid-cols-4 gap-4 mb-5">
                    <label className="text-text-dark flex items-center justify-end">Height</label>
                    <input
                        type="text"
                        name="height"
                        className="text-sm rounded-lg p-2.5 col-span-3
                        bg-bg-dark border border-text-muted-dark text-text-dark"
                        placeholder="1.7m - Give units so model understands"
                    />
                </div>
                <div className="grid grid-cols-4 gap-4 mb-5">
                    <label className="text-text-dark flex items-center justify-end">Personality</label>
                    <textarea
                        name="personality"
                        rows={2}
                        className="text-sm rounded-lg p-2.5 col-span-3
                        bg-bg-dark border border-text-muted-dark text-text-dark"
                        placeholder="Character has a bad sense of humor..."
                    />
                </div>
                <div className="grid grid-cols-4 gap-4 mb-5">
                    <label className="text-text-dark flex items-center justify-end">Loves</label>
                    <input
                        type="text"
                        name="loves"
                        className="text-sm rounded-lg p-2.5 col-span-3
                        bg-bg-dark border border-text-muted-dark text-text-dark"
                        placeholder="Cookies"
                    />
                </div>
                <div className="grid grid-cols-4 gap-4 mb-5">
                    <label className="text-text-dark flex items-center justify-end">Hates</label>
                    <input
                        type="text"
                        name="hates"
                        className="text-sm rounded-lg p-2.5 col-span-3
                        bg-bg-dark border border-text-muted-dark text-text-dark"
                        placeholder="Bugs"
                    />
                </div>
                <div className="grid grid-cols-4 gap-4 mb-5">
                    <label className="text-text-dark flex items-center justify-end">Additional Details</label>
                    <textarea
                        name="details"
                        rows={2}
                        className="text-sm rounded-lg p-2.5 col-span-3
                        bg-bg-dark border border-text-muted-dark text-text-dark"
                        placeholder="Honestly can be left blank, but fill in if there's anything else you want to add"
                    />
                </div>
                <div className="grid grid-cols-4 gap-4 mb-5">
                    <label className="text-text-dark flex items-center justify-end">Scenario</label>
                    <textarea
                        name="scenario"
                        rows={2}
                        className="text-sm rounded-lg p-2.5 col-span-3
                        bg-bg-dark border border-text-muted-dark text-text-dark"
                        placeholder="{{user}} is messaging Character because..."
                    />
                </div>
                <div className="grid grid-cols-4 gap-4 mb-5">
                    <label className="text-text-dark flex items-center justify-end">Important</label>
                    <textarea
                        name="important"
                        rows={2}
                        className="text-sm rounded-lg p-2.5 col-span-3
                        bg-bg-dark border border-text-muted-dark text-text-dark"
                        placeholder="Anything here will be given additional emphasis"
                    />
                </div>
                <div className="grid grid-cols-4 gap-4 mb-5">
                    <label className="text-text-dark flex items-center justify-end">Initial Message</label>
                    <textarea
                        name="initial_message"
                        rows={2}
                        className="text-sm rounded-lg p-2.5 col-span-3
                        bg-bg-dark border border-text-muted-dark text-text-dark"
                        placeholder="Leave this blank if you want users to message first"
                    />
                </div>
                <div className="grid grid-cols-4 gap-4 mb-5">
                    <label className="text-text-dark flex items-center justify-end">Image Generation</label>
                    <label className="inline-flex items-center cursor-pointer">
                        <input
                            name="imgGen"
                            type="checkbox"
                            value={1}
                            className="sr-only peer"
                            onChange={(e) => setImgGen(e.currentTarget.checked)}
                        />
                        <div
                            className={`
                                relative w-11 h-6 rounded-full
                                bg-hover-dark
                                peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full
                                after:content-[''] after:absolute after:top-[2px] after:start-[2px] 
                                after:border after:border-hover-dark peer-checked:after:border-white after:bg-white 
                                after:rounded-full after:h-5 after:w-5 after:transition-all
                                peer-checked:bg-text-muted-dark
                            `}
                        ></div>
                    </label>
                </div>
                {imgGen && (
                    <div>
                        <p className="flex text-2xl justify-center mb-4">Image Generation</p>
                        <p className="flex justify-center text-text-muted-dark">
                            This section is used to generate images with stable diffusion.
                        </p>
                        <p className="flex justify-center mb-4 text-text-muted-dark">
                            Give answers as comma separated values. For example: "red, square, 3,"
                        </p>
                        <div className="grid grid-cols-4 gap-4 mb-5">
                            <label className="text-text-dark flex items-center justify-end">Appearance</label>
                            <textarea
                                name="appearance"
                                rows={2}
                                className="text-sm rounded-lg p-2.5 col-span-3
                        bg-bg-dark border border-text-muted-dark text-text-dark"
                                placeholder={imagePlaceholder}
                            />
                        </div>
                        <div className="grid grid-cols-4 gap-4 mb-5">
                            <label className="text-text-dark flex items-center justify-end">Global Positives</label>
                            <textarea
                                name="global_positive"
                                rows={2}
                                className="text-sm rounded-lg p-2.5 col-span-3
                        bg-bg-dark border border-text-muted-dark text-text-dark"
                                placeholder={gpPlaceholder}
                            />
                        </div>
                        <div className="grid grid-cols-4 gap-4 mb-5">
                            <label className="text-text-dark flex items-center justify-end">Global Negatives</label>
                            <textarea
                                name="global_negative"
                                rows={2}
                                className="text-sm rounded-lg p-2.5 col-span-3
                        bg-bg-dark border border-text-muted-dark text-text-dark"
                                placeholder="drawing, lowres, bad anatomy, bad hands, missing fingers,  worst quality, etc..."
                            />
                        </div>
                        <div className="grid grid-cols-4 gap-4 mb-5">
                            <div>
                                <label className="text-text-dark flex items-center justify-end">Model</label>
                                <small className="text-xs flex items-center justify-end text-text-muted-dark">
                                    Get the AIR from civitai
                                </small>
                            </div>
                            <textarea
                                name="model"
                                rows={2}
                                className="text-sm rounded-lg p-2.5 col-span-3
                        bg-bg-dark border border-text-muted-dark text-text-dark"
                                placeholder="urn:air:sdxl:checkpoint:civitai:257749@290640"
                            />
                        </div>
                    </div>
                )}
                <button
                    type="submit"
                    className="
                    font-medium rounded-lg text-4xl px-5 py-2.5 me-2 mb-2 w-full h-20
                    text-white bg-bg-dark hover:bg-hover-dark 
                    focus:outline-none focus:ring-4 focus:ring-gray-300 "
                >
                    Submit!
                </button>
            </Form>
        </div>
    );
}
