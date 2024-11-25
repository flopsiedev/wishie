<script lang="ts">
    import { page } from "$app/stores";

    let { data } = $props();

    async function signIn() {
        window.location.href = '/auth';
    }
</script>

{#if !data.authenticated}
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
        <div class="max-w-md w-full space-y-8 p-8">
            <div class="text-center">
                <h2 class="text-3xl font-bold">Welcome</h2>
                <p class="mt-2 text-gray-600">Please sign in to continue</p>
            </div>
            <div class="mt-8">
                <button
                    onclick={signIn}
                    class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Sign in with Google
                </button>
            </div>
        </div>
    </div>
{:else}
    <div>
        <h1>Welcome, {data.user!.name}!</h1>
    </div>
    <div class="p-4">
        <h2 class="text-xl font-bold mb-4">Current Session</h2>
        <div class="bg-gray-50 p-4 rounded-lg">
            {#if data.authenticated && data.session}
                <p>Device Type: {data.session.deviceType}</p>
                <p>Last Used: {new Date(data.session.lastUsed).toLocaleString()}</p>
            {/if}
        </div>
    </div>
{/if}
