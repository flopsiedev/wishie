<script lang="ts">
    import StarryBackground from "$lib/components/StarryBackground.svelte";
    import GoogleSignIn from "$lib/components/GoogleSignInButton.svelte";
    import FlopsieDesign from "$lib/components/branding/FlopsieDesign.svelte";
    import Logo from "$lib/components/branding/Logo.svelte";
    import Socials from "$lib/components/Socials.svelte";
    let { data } = $props();
</script>

<StarryBackground/>

{#if !data.authenticated}
<div id="window"class="flex flex-col h-screen w-full px-9 sm:px-32 justify-between">
    <div id="header" class="flex flex-row justify-between items-center py-4">
        <Logo/>
        <form id="sign-out-button" action="/signout" method="POST">
            <button class="btn btn-neutral gap-4">
                Sign Out
                <img alt="User Avatar" class="w-6 h-6 rounded-full" />
            </button>
        </form>
    </div>
    <!-- 
    TODO 
    • Change to disable when generating entry
    • Listen for PASTE function to start generation
    • Listen for ENTER key to start generation 
     -->
    <div id="content" class="h-full lg:px-52 py-5">
        <div id="generate-field">
            <input type="text" class="input input-ghost hover:input-bordered w-full" placeholder="Paste a product URL..." />
        </div>
        <div id="entries" class="flex flex-col h-full"></div>
    </div>
    <footer class="footer flex flex-row w-full justify-between items-center py-8 px-2">
        <aside class="grid-flow-col items-center">
            <FlopsieDesign/>
        </aside>
        <Socials />
    </footer>
</div>
{:else}
<div></div>
{/if}

<!--
    <div class="min-h-screen flex flex-col items-center justify-center gap-5">
        <Logo/>
        <p class="text-white text-center font-mono font-semibold w-96">A wishlist app, it's that simple.</p>
        <GoogleSignIn/>
        <p class="text-xs text-white opacity-80">Designed by <a href="https://github.com/flopsiedev" class="underline">flopsie.design</a></p>
        <Socials/>
    </div>
-->