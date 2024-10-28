import { json } from "@remix-run/node";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, redirect } from "@remix-run/react";
import { prefs } from "./../utils/cookies";
import { api, endpoints } from "./../utils/api";

export async function loader({ request }: LoaderFunctionArgs) {
    const cookieHeader = request.headers.get("Cookie");
    const cookie = (await prefs.parse(cookieHeader)) || {};
    return json({
        userPrefs: { debug: cookie.debug },
    });
}

export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData();
    const payload = {
        username: formData.get("username"),
        password: formData.get("password"),
    };
    const response = await api().post(endpoints.login(), payload);
    if (response.status != 200) {
        return json({ error: "Login failed" }, { status: response.status });
    }
    // set token in cookie
    const cookieHeader = request.headers.get("Cookie");
    const cookie = (await prefs.parse(cookieHeader)) || {};
    cookie.jwt = response.data;
    return redirect("/", {
        headers: {
            "Set-Cookie": await prefs.serialize(cookie),
        },
    });
}

export default function Login() {
    return (
        <div>
            <h1 className="flex pb-2 justify-center">Welcome to Echoes AI</h1>
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
                <hr />
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <button
                        type="submit"
                        className="py-2 px-4 border rounded font-semibold
                        bg-transparent  text-character border-character
                        hover:bg-character hover:text-contrast hover:border-transparent"
                    >
                        Login
                    </button>
                    <Link to="/register">
                        <button
                            className="py-2 px-4 border rounded font-semibold
                        bg-transparent  text-character border-character
                        hover:bg-character hover:text-contrast hover:border-transparent"
                        >
                            Register
                        </button>
                    </Link>
                </div>
            </Form>
        </div>
    );
}
