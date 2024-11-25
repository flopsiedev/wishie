import { google } from "$lib/server/oauth";
import { ObjectParser } from "@pilcrowjs/object-parser";
import { createUser, getUserFromGoogleId } from "$lib/server/user";
import { createSession, generateSessionToken, setSessionTokenCookie, deleteSessionTokenCookie } from "$lib/server/session";
import { decodeIdToken } from "arctic";

import type { RequestEvent } from "./$types";
import type { OAuth2Tokens } from "arctic";
import { sessionTable } from "$lib/server/db/schema";
import { db } from "$lib/server/db";
import { eq } from "drizzle-orm";

export async function GET(event: RequestEvent): Promise<Response> {
	const storedState = event.cookies.get("google_oauth_state") ?? null;
	const codeVerifier = event.cookies.get("google_code_verifier") ?? null;
	const code = event.url.searchParams.get("code");
	const state = event.url.searchParams.get("state");

	if (storedState === null || codeVerifier === null || code === null || state === null || storedState !== state) {
		return new Response(null, {
			status: 302,
			headers: {
				Location: "/"
			}
		});
	}

	let tokens: OAuth2Tokens;
	try {
		tokens = await google.validateAuthorizationCode(code, codeVerifier);
	} catch (e) {
		console.error('OAuth validation error:', e);
		
		return new Response(null, {
			status: 302,
			headers: {
				Location: "/"
			}
		});
	}

	const claims = decodeIdToken(tokens.idToken());
	const claimsParser = new ObjectParser(claims);

	const googleId = claimsParser.getString("sub");
	const name = claimsParser.getString("name");
	const picture = claimsParser.getString("picture");
	const email = claimsParser.getString("email");

	const existingUser = await getUserFromGoogleId(googleId);
	if (existingUser !== null) {
		const previousSession = await db
			.select()
			.from(sessionTable)
			.where(eq(sessionTable.userId, existingUser.id))
			.limit(1);
		await db.delete(sessionTable)
			.where(eq(sessionTable.userId, existingUser.id));

		deleteSessionTokenCookie(event);

		const sessionToken = generateSessionToken();
		const userAgent = event.request.headers.get('user-agent') ?? 'Unknown';
		const session = await createSession(sessionToken, existingUser.id, userAgent);

		setSessionTokenCookie(event, sessionToken, session.expiresAt);

		return new Response(null, {
			status: 302,
			headers: {
				Location: "/"
			}
		});
	}

	const user = await createUser(googleId, email, name, picture);
	const sessionToken = generateSessionToken();
	const userAgent = event.request.headers.get('user-agent') ?? 'Unknown';
	const session = await createSession(sessionToken, user.id, userAgent);

	setSessionTokenCookie(event, sessionToken, session.expiresAt);

	return new Response(null, {
		status: 302,
		headers: {
			Location: "/"
		}
	});
}