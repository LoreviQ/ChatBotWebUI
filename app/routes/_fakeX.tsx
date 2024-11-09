import { Outlet } from "@remix-run/react";

export default function FakeX() {
    return (
        <div className="flex">
            <div className="w-1/3"></div>
            <div className="w-1/3">
                <Outlet />
            </div>
            <div className="w-1/3"></div>
        </div>
    );
}
