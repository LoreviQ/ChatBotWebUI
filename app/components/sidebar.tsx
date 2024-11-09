import { Link } from "@remix-run/react";

import type { Cookie } from "../utils/cookies";

// Renders the sidebar of the page
interface SidebarProps {
    userPrefs: Cookie;
    loggedIn: boolean;
}
export function Sidebar({ userPrefs, loggedIn }: SidebarProps) {
    return (
        <div className="flex h-screen w-full justify-end py-4 space-y-4 border-r border-text-muted-dark">
            <div className="w-80 flex flex-col">
                <Link to={"/"} className="text-5xl font-ophelia font-outline">
                    Echoes AI
                </Link>
            </div>
        </div>
    );
}
