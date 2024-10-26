import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link } from "@remix-run/react";
import { prefs } from "./../utils/cookies";

export async function loader({ request }: LoaderFunctionArgs) {
    const cookieHeader = request.headers.get("Cookie");
    const cookie = (await prefs.parse(cookieHeader)) || {};
    return json({
        userPrefs: { debug: cookie.debug },
    });
}

export default function Login() {
    return (
        <div>
            <h1 className="flex pb-2 justify-center">Create an account</h1>
            <hr />
            <Form action="/login" method="POST">
                <label className="py-2 text-text-muted-dark text-sm flex items-center">Username</label>
                <input
                    type="text"
                    id="username"
                    name="username"
                    className="text-sm rounded-lg p-2.5 col-span-3
                        bg-bg-dark border border-text-muted-dark text-text-dark "
                    placeholder="username"
                    required
                />
                <label className="py-2 text-text-muted-dark text-sm flex items-center">Email</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    className="text-sm rounded-lg p-2.5 col-span-3
                        bg-bg-dark border border-text-muted-dark text-text-dark "
                    placeholder="user@email.com"
                    required
                />
                <label className="py-2 text-text-muted-dark text-sm flex items-center">Password</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    className="text-sm rounded-lg p-2.5 col-span-3
                        bg-bg-dark border border-text-muted-dark text-text-dark "
                    placeholder="password"
                    required
                />
                <div className="py-2" />
                <input
                    type="password"
                    id="password-reenter"
                    name="password-reenter"
                    className="text-sm rounded-lg p-2.5 col-span-3
                        bg-bg-dark border border-text-muted-dark text-text-dark "
                    placeholder="re-enter password"
                    required
                />
                <div className="py-2" />
                <hr />
                <button
                    type="submit"
                    className="w-full mt-4 py-2 px-4 border rounded font-semibold
                        bg-transparent  text-character border-character
                        hover:bg-character hover:text-contrast hover:border-transparent"
                >
                    Create Account
                </button>
            </Form>
        </div>
    );
}
