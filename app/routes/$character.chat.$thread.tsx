import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
    return [{ title: "Ophelia" }, { name: "description", content: "Chat with Ophelia" }];
};

export default function Chat() {
    const placeholder_message = "Send a message to Ophelia!\nEnter to send. Alt-Enter for linebreak.";
    return (
        <div>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
            ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
            nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit
            anim id est laborum.
            <form>
                <div className="flex items-center py-2 rounded-lg">
                    <textarea
                        id="chat"
                        rows={4}
                        className="block p-2.5 w-full text-sm rounded-lg border text-gray-900 bg-white border-pink-600 dark:bg-zinc-900 dark:placeholder-gray-400 dark:text-white"
                        placeholder="Send a message to Ophelia!"
                    ></textarea>
                    <button
                        type="submit"
                        className="inline-flex justify-center ps-4 p-2 text-pink-600 rounded-full cursor-pointer"
                    >
                        <svg
                            className="w-5 h-5 rotate-90 rtl:-rotate-90"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor"
                            viewBox="0 0 18 20"
                        >
                            <path d="m17.914 18.594-8-18a1 1 0 0 0-1.828 0l-8 18a1 1 0 0 0 1.157 1.376L8 18.281V9a1 1 0 0 1 2 0v9.281l6.758 1.689a1 1 0 0 0 1.156-1.376Z" />
                        </svg>
                        <span className="sr-only">Send message</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
