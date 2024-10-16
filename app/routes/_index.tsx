import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
    return [{ title: "Ophelia" }, { name: "description", content: "Chat with Ophelia" }];
};

export default function Index() {
    const placeholder_message = "Send a message to Ophelia!\nEnter to send. Alt-Enter for linebreak.";
    return (
        <div className="container mx-auto max-w-2xl">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
            ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
            nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit
            anim id est laborum.
            <form>
                <div>
                    <input
                        type="text"
                        id="messageInput"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder={placeholder_message}
                    />
                </div>
            </form>
        </div>
    );
}
