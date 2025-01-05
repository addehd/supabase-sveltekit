<script>
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { createScene } from '$lib/solo';
  import Loading from '$lib/components/Loading.svelte';

  export let data;

  let el;
  let showDiv = true;

  onMount(() => {
    createScene(el, data.artworks);
    setTimeout(() => {
      showDiv = false;
    }, 1000);

    const svgs = document.querySelectorAll('svg');
    svgs.forEach(svg => {
      svg.classList.add('active');
    });
  });
</script>

<canvas 
  class="w-full h-full fixed top-0 left-0" 
  bind:this={el} />

<header class="fixed bottom-0 w-full p-9 z-50 pointer-events-none">
  <div class="bg-gray-900/25 backdrop-blur-lg absolute inset-0"></div>
  <nav class="flex space-x-[20rem] justify-end pointer-events-auto relative">
    <div class="text-white font-bold text-xl">
      <a href="/rum/32">Hangaren</a>
    </div>
  </nav>
</header>

<!-- {#if showDiv}
  <div
    class="fixed inset-0 bg-black flex items-center justify-center z-50"
    transition:fade="{{ duration: 0 }}">
    <div class="w-[20rem] h-[10rem]">
      <Loading />
    </div>
  </div>
{/if} -->