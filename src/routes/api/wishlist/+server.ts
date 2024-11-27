import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { wishlistTable } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestEvent } from './$types';
import { validateSessionToken } from '$lib/server/session';

export async function GET(event: RequestEvent) {
    const sessionToken = event.cookies.get('session');
    
    if (!sessionToken) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user } = await validateSessionToken(sessionToken);
    
    if (!user) {
        return json({ error: 'Invalid session' }, { status: 401 });
    }

    try {
        const [wishlist] = await db
            .select()
            .from(wishlistTable)
            .where(eq(wishlistTable.ownerId, user.id))
            .limit(1);

        if (!wishlist) {
            return json([]);
        }

        const content = typeof wishlist.content === 'string' 
            ? JSON.parse(wishlist.content) 
            : wishlist.content;

        return json(content || []);
    } catch (error) {
        return json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
