import { deleteSessionTokenCookie } from "$lib/server/session";
import type { RequestEvent } from "@sveltejs/kit";

export async function POST(event: RequestEvent): Promise<Response> {
    deleteSessionTokenCookie(event);
    
    return new Response(null, {
        status: 302,
        headers: {
            Location: "/"
        }
    });
}