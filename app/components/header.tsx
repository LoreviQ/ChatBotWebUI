import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { CharacterOutlineButton } from "../components/buttons";
import type { Cookie } from "../utils/cookies";
import { useFetcher, useSubmit, Link } from "@remix-run/react";

// Rendrs the header of the page
interface headerProps {
    title: string;
    userPrefs: Cookie;
    titleLink: string;
    loggedIn: boolean;
    showBackButton: boolean;
}
export function Header({ title, userPrefs, titleLink, loggedIn, showBackButton }: headerProps) {
    const fetcher = useFetcher();
    const submit = useSubmit();
    return (
        <div>
            <div
                className="
                    absolute top-0 left-0 w-full h-20 flex items-center
                    backdrop-blur-sm backdrop-saturate-200 backdrop-contrast-150 bg-bg-dark/50 
                    border-b-4 border-character
                    z-40
                "
            >
                <div className="p-4 flex justify-between w-full">
                    <div className="flex">
                        {showBackButton && (
                            <Link to="/characters" className="pe-4">
                                <button
                                    className="py-2 px-4  rounded font-semibold
                            bg-transparent  text-character 
                            hover:bg-character hover:text-contrast "
                                >
                                    <FontAwesomeIcon icon={faArrowLeft} />
                                </button>
                            </Link>
                        )}
                        <fetcher.Form
                            className="flex"
                            onChange={(e) => {
                                submit(e.currentTarget, { method: "post", navigate: false });
                            }}
                        >
                            <label className="items-center inline-flex cursor-pointer">
                                <input
                                    name="debug"
                                    type="checkbox"
                                    value={1}
                                    className="sr-only peer"
                                    defaultChecked={userPrefs.debug}
                                />
                                <div
                                    className="
                                        relative w-11 h-6 rounded-full
                                        bg-hover-dark
                                        peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full  peer-checked:bg-character
                                        after:content-[''] after:absolute after:top-[2px] after:start-[2px] 
                                        after:border after:border-hover-dark peer-checked:after:border-white after:bg-white 
                                        after:rounded-full after:h-5 after:w-5 after:transition-all  
                                    "
                                ></div>
                                <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Debug</span>
                            </label>
                        </fetcher.Form>
                    </div>
                    {loggedIn ? (
                        <fetcher.Form method="post" action="/logout">
                            <CharacterOutlineButton text="Logout" />
                        </fetcher.Form>
                    ) : (
                        <Link to="/login">
                            <CharacterOutlineButton text="Login" />
                        </Link>
                    )}
                </div>
                <Link
                    to={titleLink}
                    className="absolute z-40 left-1/2 transform -translate-x-1/2 text-5xl font-ophelia font-outline"
                >
                    <button className="" type="button">
                        {title}
                    </button>
                </Link>
            </div>
        </div>
    );
}

function HeaderModel() {
    return (
        <div>
            <div
                className={`
                        flex text-xl justify-between absolute z-50 left-1/2 
                        transform -translate-x-1/2 p-2 rounded-lg bg-bg-dark 
                        border-2 border-t-4 border-character
                        `}
                style={{ top: "76px" }}
            >
                <button className="px-4 mx-2 py-2">Events</button>
                <button className="px-4 mx-2 py-2">Chat</button>
                <button className="px-4 mx-2 py-2">Posts</button>
            </div>
        </div>
    );
}
