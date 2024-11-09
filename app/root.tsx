import type { LinksFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    useRouteError,
    isRouteErrorResponse,
    useLoaderData,
} from "@remix-run/react";

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
    return (
        <div className="flex w-full h-screen items-center justify-center">
            <div className="p-10 bg-contrast border-2 text-character border-character rounded-lg">
                <h1>
                    {isRouteErrorResponse(error)
                        ? `${error.status} ${error.statusText}`
                        : error instanceof Error
                        ? error.message
                        : "Unknown Error"}
                </h1>
            </div>
        </div>
    );
}

export const loader = async () => {
    return json({
        ENV: {
            API_URL: process.env.API_URL,
        },
    });
};

export function Layout({ children }: { children: React.ReactNode }) {
    const data = useLoaderData<typeof loader>();
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <Meta />
                <Links />
            </head>
            <body>
                {children}
                <ScrollRestoration />
                <Scripts />
                <script
                    dangerouslySetInnerHTML={{
                        __html: `window.ENV = ${JSON.stringify(data.ENV)}`,
                    }}
                />
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
