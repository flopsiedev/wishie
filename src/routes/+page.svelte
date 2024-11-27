<script lang="ts">
    import StarryBackground from "$lib/components/StarryBackground.svelte";
    import GoogleSignIn from "$lib/components/GoogleSignInButton.svelte";
    import FlopsieDesign from "$lib/components/branding/FlopsieDesign.svelte";
    import Logo from "$lib/components/branding/Logo.svelte";
    import Socials from "$lib/components/Socials.svelte";
    import WishlistContent from "$lib/components/WishlistContent.svelte";
    let { data } = $props();
</script>

<StarryBackground/>

{#if !data.authenticated}
    <!-- Authentication content -->
    <div class="min-h-screen flex flex-col items-center justify-center gap-5">
        <Logo/>
        <p class="text-white text-center font-mono font-semibold w-96">A wishlist app, it's that simple.</p>
        <GoogleSignIn/>
        <p class="text-xs text-white opacity-80">Designed by <a href="https://github.com/flopsiedev" class="underline">flopsie.design</a></p>
        <Socials/>
    </div>
{:else}
    <div id="window" class="flex flex-col h-screen w-full px-9 sm:px-32">
        <div id="header" class="flex flex-row justify-between items-center py-4 flex-shrink-0">
            <Logo/>
            <form id="sign-out-button" action="/signout" method="POST">
                <button class="btn btn-neutral gap-4">
                    Sign Out
                    <img alt="User Avatar" src={data!.user!.picture} class="w-6 h-6 rounded-full" />
                </button>
            </form>
        </div>
        
        <div id="content" class="flex-1 lg:px-52 py-5 overflow-y-auto relative">
            <WishlistContent {data} />
        </div>

        <footer class="footer flex flex-row w-full justify-between items-center py-8 px-2 flex-shrink-0">
            <aside class="grid-flow-col items-center">
                <FlopsieDesign/>
            </aside>
            <Socials />
        </footer>
    </div>
{/if}