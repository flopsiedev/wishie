import { google } from "$lib/server/oauth";
import type { RequestEvent } from "@sveltejs/kit";
import { generateCodeVerifier, generateState } from "arctic";

export async function GET(event: RequestEvent): Promise<Response> {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    const url = google.createAuthorizationURL(
        state, 
        codeVerifier, 
        ["openid", "profile", "email"]
    );

    event.cookies.set("google_oauth_state", state, {
        path: "/",
        httpOnly: true,
        maxAge: 60 * 10,
        sameSite: "lax"
    });
    event.cookies.set("google_code_verifier", codeVerifier, {
        path: "/",
        httpOnly: true,
        maxAge: 60 * 10,
        sameSite: "lax"
    });
    
    return new Response(null, {
        status: 302,
        headers: {
            Location: url.toString()
        }
    });
}