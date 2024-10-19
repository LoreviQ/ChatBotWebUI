import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { prefs } from "./../utils/cookies";
import { useLoaderData, useFetcher, Outlet, useSubmit } from "@remix-run/react";

export async function loader({ params, request }: LoaderFunctionArgs) {
    const cookieHeader = request.headers.get("Cookie");
    const cookie = (await prefs.parse(cookieHeader)) || {};
    return json({ userPrefs: { debug: cookie.debug } });
}

export async function action({ request }: ActionFunctionArgs) {
    const cookieHeader = request.headers.get("Cookie");
    const cookie = (await prefs.parse(cookieHeader)) || {};
    const formData = await request.formData();
    let debug: boolean = false;
    if (formData.has("debug")) {
        debug = true;
    }
    cookie.debug = debug;
    return json(debug, {
        headers: {
            "Set-Cookie": await prefs.serialize(cookie),
        },
    });
}

export default function Header() {
    const fetcher = useFetcher();
    const loaderData = useLoaderData<typeof loader>();
    const submit = useSubmit();

    return (
        <div>
            <div
                className="
                    absolute top-0 left-0 w-full h-20 flex items-center
                    backdrop-blur-sm backdrop-saturate-200 backdrop-contrast-150 bg-bg-dark/50 
                    border-double border-b-4 border-primary-dark
                "
            >
                <fetcher.Form
                    className="p-4"
                    onChange={(e) => {
                        submit(e.currentTarget, { method: "post", navigate: false });
                    }}
                >
                    <label className="inline-flex items-center cursor-pointer">
                        <input
                            name="debug"
                            type="checkbox"
                            value={1}
                            className="sr-only peer"
                            defaultChecked={loaderData.userPrefs.debug}
                        />
                        <div
                            className="
                                relative w-11 h-6 rounded-full
                                bg-hover-dark
                                peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full  peer-checked:bg-primary-dark
                                after:content-[''] after:absolute after:top-[2px] after:start-[2px] 
                                after:border after:border-hover-dark peer-checked:after:border-white after:bg-white 
                                after:rounded-full after:h-5 after:w-5 after:transition-all  
                            "
                        ></div>
                        <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Debug</span>
                    </label>
                </fetcher.Form>
            </div>
            <p className="absolute mt-4 left-1/2 transform -translate-x-1/2 text-5xl font-ophelia font-outline">
                Ophelia
            </p>
            <Outlet />
        </div>
    );
}
