import { json } from "@remix-run/node";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, redirect } from "@remix-run/react";
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
    const password = formData.get("password");
    const repeatPassword = formData.get("password-reenter");
    if (password !== repeatPassword) {
        return json({ error: "Passwords do not match" }, { status: 400 });
    }
    const payload = {
        username: formData.get("username"),
        password: password,
        email: formData.get("email"),
    };
    const response = await api.post(endpoints.users(), payload);
    if (response.status != 200) {
        return json({ error: "Registration failed" }, { status: response.status });
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
            <h1 className="flex pb-2 justify-center">Create an account</h1>
            <hr />
            <Form action="/register" method="POST">
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
