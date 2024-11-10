import type { LinksFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useRouteError, useLoaderData } from "@remix-run/react";

import "./tailwind.css";
import "./styles.css";
import { ErrorDisplay } from "./components/warnings";

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
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <Meta />
                <Links />
            </head>
            <body>
                <ErrorDisplay error={error} />
                <ScrollRestoration />
                <Scripts />
                <script
                    // default to localhost (will fail for production but bypasses the death spiral so the real API URL can be fetched from loader
                    dangerouslySetInnerHTML={{
                        __html: `window.ENV = ${JSON.stringify({
                            API_URL: "http://localhost:5000",
                        })}`,
                    }}
                />
            </body>
        </html>
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
