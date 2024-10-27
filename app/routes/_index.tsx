import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/react";

export async function loader({ request }: LoaderFunctionArgs) {
    const url = new URL(request.url);
    if (url.pathname === "/") {
        return redirect("/characters");
    }
    return null;
}
