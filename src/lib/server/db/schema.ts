import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const userTable = sqliteTable("user", {
	id: integer("id").primaryKey(),
	googleId: text("google_id").unique(),
	email: text("email").notNull(),
	name: text("name").notNull(),
	picture: text("picture").notNull(),
	username: text("username").unique(),
});

export const sessionTable = sqliteTable('session', {
	id: text('id').primaryKey(),
	userId: integer('user_id')
		.notNull()
		.references(() => userTable.id),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
	userAgent: text('user_agent'),
	deviceType: text('device_type'),
	browser: text('browser'),
	os: text('os'),
	lastUsed: integer('last_used', { mode: 'timestamp' }).notNull()
});

export const wishlistTable = sqliteTable("wishlist", {
	id: text("id").primaryKey(),
	name: text("name").notNull().default("default"),
	ownerId: integer("owner_id")
		.notNull()
		.references(() => userTable.id),
	createdOn: integer("created_on", { mode: "timestamp" }).notNull(),
	content: text("content").notNull(),
});

export type Session = typeof sessionTable.$inferSelect;
export type User = typeof userTable.$inferSelect;
export interface WishlistEntry {
	order: number;
	product_name: string;
	current_price: string;
	original_price: string | null;
	url: string;
}
