import { Outlet } from "react-router-dom";

export default function Auth() {
    return (
        <div className="flex w-full h-screen items-center justify-center">
            <div className="px-10 py-5 bg-contrast border-2 text-character border-character rounded-lg">
                <Outlet />
            </div>
        </div>
    );
}
