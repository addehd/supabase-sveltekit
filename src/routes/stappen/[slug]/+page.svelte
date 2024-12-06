<script>
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { createScene } from '$lib/stappen';
  import Loading from '$lib/components/Loading.svelte';
  import { videoElement, videoSource } from '$lib/stores/video-store';

  export let data;

  let el;
  let showDiv = true;

  const handleClick = async (event) => {
    await el.requestPointerLock({
      unadjustedMovement: true,
    });
  };

  onMount(() => {
    createScene(el, data.artworks);
    setTimeout(() => {
      showDiv = false;
    }, 100);
  });
</script>


<canvas 
  class="w-full h-full fixed top-0 left-0" 
  bind:this={el}
  on:click|preventDefault|stopPropagation={handleClick}
/>

<header class="bg-green-400 fixed bottom-0 w-full p-4 z-50 pointer-events-none">
  <nav class="flex space-x-[20rem] justify-end pointer-events-auto">
    <!-- <div class="text-white font-bold text-xl left-20">

    </div> -->

    <div class="text-white font-bold text-xl">
      STÄPPEN
    </div>
  </nav>
</header>

{#if showDiv}
  <div
    class="fixed inset-0 bg-black flex items-center justify-center z-50"
    transition:fade="{{ duration: 500 }}">
    <div class="w-[20rem] h-[10rem]">
      <Loading />
    </div>
  </div>
{/if}