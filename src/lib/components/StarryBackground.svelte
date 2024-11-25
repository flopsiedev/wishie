<script lang="ts">
    import { onMount } from 'svelte';

    const baseOpacities = [0.4, 0.3, 0.2];
    const flickerRange = 0.1;
    const flickerSpeed = 0.003;

    let stars: Array<{
        x: string;
        y: string;
        size: number;
        flickerOffset: number;
        layer: number;
    }> = [];

    onMount(() => {
        const starCount = window.innerWidth > 768 ? 600 : 400;
        stars = Array.from({ length: starCount }, () => ({
            x: `${Math.random() * 100}%`,
            y: `${Math.random() * 100}%`,
            size: (Math.random() * 0.05 + 0.03) * (window.innerWidth > 768 ? 1 : 1.5),
            flickerOffset: Math.random() * Math.PI * 2,
            layer: Math.floor(Math.random() * 3)
        }));

        let animationFrame = requestAnimationFrame(function animate(timestamp: number) {
            stars.forEach((star, i) => {
                const element = document.getElementById(`star-${i}`);
                if (element) {
                    const flicker = Math.sin((timestamp * flickerSpeed) + star.flickerOffset) * flickerRange;
                    const opacity = Math.max(0, Math.min(1, baseOpacities[star.layer] + flicker));
                    element.style.opacity = opacity.toString();
                }
            });
            animationFrame = requestAnimationFrame(animate);
        });

        return () => cancelAnimationFrame(animationFrame);
    });
</script>

<div class="fixed inset-0 -z-10" style="background-color: rgb(7 7 19);">
    <svg 
        class="w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
    >
        {#each stars as star, i}
            <circle
                id="star-{i}"
                cx={star.x}
                cy={star.y}
                r={star.size}
                fill="white"
                opacity={baseOpacities[star.layer]}
            />
        {/each}
    </svg>
</div>
