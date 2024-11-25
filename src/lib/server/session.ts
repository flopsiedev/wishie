import { db } from "./db";
import { encodeBase32, encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import { eq } from "drizzle-orm";
import { sessionTable, userTable } from "./db/schema";

import type { User, Session } from "./db/schema";
import type { RequestEvent } from "@sveltejs/kit";
import { getDeviceInfo } from "./fingerprint";

export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	
	const [result] = await db
		.select({
			session: sessionTable,
			user: userTable
		})
		.from(sessionTable)
		.innerJoin(userTable, eq(sessionTable.userId, userTable.id))
		.where(eq(sessionTable.id, sessionId))
		.limit(1);

	if (!result) {
		return { session: null, user: null };
	}

	const { session, user } = result;
	const now = new Date();

	// Check if session is expired
	if (now >= session.expiresAt) {
		await db.delete(sessionTable)
			.where(eq(sessionTable.id, session.id));
		return { session: null, user: null };
	}

	// Refresh session if it's close to expiring (15 days)
	const fifteenDaysFromNow = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 15);
	if (session.expiresAt <= fifteenDaysFromNow) {
		const newExpiresAt = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30);
		await db.update(sessionTable)
			.set({ expiresAt: newExpiresAt })
			.where(eq(sessionTable.id, session.id));
		session.expiresAt = newExpiresAt;
	}

	return { session, user };
}

export async function invalidateSession(sessionId: string): Promise<void> {
	await db.delete(sessionTable)
		.where(eq(sessionTable.id, sessionId));
}

export async function invalidateUserSessions(userId: number): Promise<void> {
	await db.delete(sessionTable)
		.where(eq(sessionTable.userId, userId));
}

export async function createSession(token: string, userId: number, userAgent: string): Promise<Session> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const now = new Date();
	const expiresAt = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30); // 30 days
	
	const deviceInfo = getDeviceInfo(userAgent);
	
	const [session] = await db.insert(sessionTable)
		.values({
			id: sessionId,
			userId,
			expiresAt,
			lastUsed: now,
			...deviceInfo
		})
		.returning();

	if (!session) {
		throw new Error('Failed to create session');
	}

	return session;
}

// These functions don't need to change as they don't interact with the database
export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date): void {
	event.cookies.set("session", token, {
		httpOnly: true,
		path: "/",
		secure: import.meta.env.PROD,
		sameSite: "lax",
		expires: expiresAt,
		priority: "high"
	});
}

export function deleteSessionTokenCookie(event: RequestEvent): void {
	event.cookies.delete("session", {
		path: "/",
		httpOnly: true,
		secure: import.meta.env.PROD,
		sameSite: "lax"
	});
}

export function generateSessionToken(): string {
	const tokenBytes = new Uint8Array(32);
	crypto.getRandomValues(tokenBytes);
	return encodeBase32(tokenBytes).toLowerCase();
}

type SessionValidationResult = { session: Session; user: User } | { session: null; user: null };