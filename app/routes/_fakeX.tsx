import { Outlet } from "@remix-run/react";

export default function FakeX() {
    return (
        <div className="flex">
            <div className="w-1/3">SIDEBAR HERE!</div>
            <div className="w-1/3">
                <Outlet />
            </div>
            <div className="w-1/3">OTHER SIDEBAR THING HERE!</div>
        </div>
    );
}
