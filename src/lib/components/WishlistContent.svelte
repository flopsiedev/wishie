<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import type { WishlistEntry } from '$lib/server/db/schema';
    
    interface PageData {
        authenticated: boolean;
        user?: {
            id: number;
            name: string;
            picture: string;
        } | undefined;
        session: any;
    }
    
    let { data } = $props<{ data: PageData }>();
    let wishlistEntries = $state<WishlistEntry[]>([]);
    let isGenerating = $state(false);
    let url = $state('');
    let error = $state<string | null>(null);
    let isScrolledTop = $state(false);
    let isScrolledBottom = $state(true);
    let isScrolling = $state(false);
    let scrollTimeout: NodeJS.Timeout;

    async function fetchWishlist() {
        if (!data.authenticated) {
            return;
        }

        try {
            const response = await fetch('/api/wishlist', {
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    ...(data.session?.token && {
                        'Authorization': `Bearer ${data.session.token}`
                    })
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            wishlistEntries = await response.json();
            error = null;
        } catch (err) {
            error = err instanceof Error ? err.message : 'Error fetching wishlist';
        }
    }

    $effect(() => {
        if (data.authenticated) {
            fetchWishlist();
        }
    });

    async function handleSubmit(event: Event) {
        event.preventDefault();
        if (!url.trim() || isGenerating) return;

        isGenerating = true;
        try {
            const response = await fetch('/api/wishlist/add', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url })
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }

            await fetchWishlist();
            url = ''; // Clear input after successful add
        } catch (err) {
            error = err instanceof Error ? err.message : 'Error adding item';
        } finally {
            isGenerating = false;
        }
    }

    function handleScroll(event: Event) {
        const target = event.target as HTMLElement;
        const scrollTop = target.scrollTop;
        const scrollHeight = target.scrollHeight;
        const clientHeight = target.clientHeight;
        
        isScrolledTop = scrollTop === 0;
        isScrolledBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 1;
        
        isScrolling = true;
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            isScrolling = false;
        }, 150);
    }

    function checkScrollPosition() {
        const entriesElement = document.getElementById('entries');
        if (entriesElement) {
            const { scrollTop, scrollHeight, clientHeight } = entriesElement;
            isScrolledTop = scrollTop === 0;
            isScrolledBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 1;
        }
    }

    onMount(() => {
        checkScrollPosition();
    });

    $effect(() => {
        // Check scroll position whenever wishlistEntries changes
        wishlistEntries;
        setTimeout(checkScrollPosition, 0);
    });

    onDestroy(() => {
        clearTimeout(scrollTimeout);
    });
</script>

<div class="flex flex-col gap-4 h-full">
    <!-- Fixed URL input at top -->
    <form 
        onsubmit={handleSubmit} 
        class="w-full flex-shrink-0"
    >
        <label class="form-control">
            <input
                type="url"
                bind:value={url}
                placeholder="Paste a product URL and press Enter..."
                class="input input-ghost w-full {error ? 'input-error' : 'hover:input-bordered'} {isGenerating ? 'input-disabled' : ''}"
                disabled={isGenerating}
                required
            />
            {#if error}
                <div class="label-text text-error">{error}</div>
            {/if}
        </label>
    </form>

    <div class="relative flex-1 min-h-0">
        <div 
            id="entries"
            class="absolute inset-0 flex flex-col gap-4 overflow-y-auto scroll-smooth
                {!isScrolledTop && !isScrolledBottom ? 'gradient-mask-t-[transparent,rgba(0,0,0,1.0)_5%,rgba(0,0,0,1.0)_95%,transparent_100%]' : 
                 !isScrolledTop ? 'gradient-mask-b-[transparent,rgba(0,0,0,1.0)_5%,rgba(0,0,0,1.0)100%]' : 
                 !isScrolledBottom ? 'gradient-mask-t-[transparent,rgba(0,0,0,1.0)_5%,rgba(0,0,0,1.0)100%]' : ''}"
            onscroll={handleScroll}
        >
            <div class="relative w-full min-h-full py-10">
                {#each wishlistEntries as item (item.order)}
                    <div class="card">
                        <div class="card-body flex flex-col xl:flex-row justify-between">
                            <h2 class="card-title w-full truncate text-ellipsis overflow-hidden font-medium">{item.product_name}</h2>
                            <div id="price-and-buy" class="flex flex-row gap-4 items-center justify-end">
                                <div id="cost" class="font-mono text-right">
                                    <p class="slashed-zero line-through opacity-80 text-sm">{item.original_price}</p>
                                    <p class="text-lg font-semibold">{item.current_price}</p>
                                </div>
                                <a href={item.url} class="btn btn-sm btn-accent">Buy</a>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    </div>
</div>