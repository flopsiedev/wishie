import { db } from "./db";
import { userTable } from "./db/schema";
import { eq } from "drizzle-orm";
import type { User } from "./db/schema";

export async function createUser(googleId: string, email: string, name: string, picture: string): Promise<User> {
	const [newUser] = await db.insert(userTable)
		.values({
			googleId,
			email,
			name,
			picture
		})
		.returning();
	
	if (!newUser) {
		throw new Error("Failed to create user");
	}
	
	return newUser;
}

export async function getUserFromGoogleId(googleId: string): Promise<User | null> {
	const [user] = await db.select()
		.from(userTable)
		.where(eq(userTable.googleId, googleId))
		.limit(1);
	
	return user || null;
}