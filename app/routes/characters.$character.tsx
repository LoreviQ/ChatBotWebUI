import { Outlet } from "@remix-run/react";
import { useOutletContext } from "react-router-dom";

import type { Character } from "./characters";

export default function CharactersData() {
    const character = useOutletContext<Character>();

    return (
        <div>
            <Outlet context={character} />
        </div>
    );
}
