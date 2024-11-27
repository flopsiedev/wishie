import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { wishlistTable } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestEvent } from './$types';
import { nanoid } from 'nanoid';
import { getProductData } from '$lib/server/agentql';
import { validateSessionToken } from '$lib/server/session';
import { z } from 'zod';

// Define a schema for WishlistEntry
const WishlistEntrySchema = z.object({
    order: z.number(),
    product_name: z.string().min(1).max(200),
    current_price: z.string().regex(/^\$?\d{1,3}(,\d{3})*(\.\d{2})?$/),
    original_price: z.string().regex(/^\$?\d{1,3}(,\d{3})*(\.\d{2})?$/).nullable(),
    url: z.string().url()
});

export async function POST(event: RequestEvent) {
    const sessionToken = event.cookies.get('session');
    
    if (!sessionToken) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user } = await validateSessionToken(sessionToken);
    
    if (!user) {
        return json({ error: 'Invalid session' }, { status: 401 });
    }

    try {
        const { url } = await event.request.json();
        
        if (!url || typeof url !== 'string' || !url.trim()) {
            return json({ error: 'Invalid URL provided' }, { status: 400 });
        }

        const productData = await getProductData(url);
        
        // Validate the product data against our schema
        const validatedData = WishlistEntrySchema.parse(productData);
        
        // Sanitize the data before storing
        const sanitizedData = {
            ...validatedData,
            product_name: validatedData.product_name.trim(),
            current_price: validatedData.current_price.trim(),
            original_price: validatedData.original_price?.trim() ?? null,
            url: validatedData.url.trim()
        };

        let [wishlist] = await db
            .select()
            .from(wishlistTable)
            .where(eq(wishlistTable.ownerId, user.id))
            .limit(1);

        if (!wishlist) {
            [wishlist] = await db.insert(wishlistTable)
                .values({
                    id: nanoid(),
                    ownerId: user.id,
                    createdOn: new Date(),
                    content: JSON.stringify([])
                })
                .returning();
        }

        const content = JSON.parse(wishlist.content || '[]');
        const newContent = [...content, {
            ...sanitizedData,
            order: content.length
        }];
        
        // Additional validation of the entire array
        const WishlistArraySchema = z.array(WishlistEntrySchema);
        WishlistArraySchema.parse(newContent);

        await db.update(wishlistTable)
            .set({
                content: JSON.stringify(newContent)
            })
            .where(eq(wishlistTable.id, wishlist.id));

        return json(sanitizedData);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return json({ error: 'Invalid product data format' }, { status: 400 });
        }
        return json(
            { error: 'Failed to process request' }, 
            { status: 500 }
        );
    }
}
