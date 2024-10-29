import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/react";

export async function loader({ request }: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const baseUrl = url.pathname.endsWith("/") ? url.pathname.slice(0, -1) : url.pathname;
    return redirect(`${baseUrl}/1`);
}
