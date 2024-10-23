import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";
import { useRouteError } from "@remix-run/react";
import { getColourVariable } from "./utils/colours";

import "./tailwind.css";
import "./styles.css";

export const links: LinksFunction = () => [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
    },
    {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
    },
];
export function ErrorBoundary() {
    const error = useRouteError();
    console.error(error);
    return (
        <html>
            <head>
                <title>Oh no!</title>
                <Meta />
                <Links />
            </head>
            <body>
                Error loading the page. Check the console for more information.
                <Scripts />
            </body>
        </html>
    );
}

export function Layout({ children }: { children: React.ReactNode }) {
    const primaryColor = getColourVariable("#FF0000", "primary");
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <style>{primaryColor}</style>
                <Meta />
                <Links />
            </head>
            <body>
                {children}
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}

export default function App() {
    return (
        <div>
            <Outlet />
        </div>
    );
}
