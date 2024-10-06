<script>
  import { onMount } from 'svelte';
  import { createScene } from '$lib/main';
  import Loading from '$lib/components/Loading.svelte';

  export let data;

  console.log('data', data.artworks);
  let imageUrl = data.artworks[0].image_url;
  let el;
  let showDiv = true;

  if (!Array.isArray(data.artworks)) {
    console.error('data.artworks is not an array');
  }

  onMount(() => {
    if (Array.isArray(data.artworks)) {
      createScene(el, data.artworks);
    }
    
    setTimeout(() => {
      showDiv = false;
    }, 1500);

    const svg = document.querySelector('svg');
    if (svg) {
      svg.classList.add('active');
    }
  });
</script>

<header class="bg-purple-400 fixed bottom-0 w-full  p-4 z-50">
  <nav class="flex space-x-[20rem] justify-around">
    <div class="text-white font-bold text-xl left-20">
      Hangaren/CFUK 
    </div>

    <div class="text-white font-bold text-xl">
      PROTOTYP - GALLERIHELG
    </div>
  </nav>
</header>

{#if showDiv}
  <div class="fixed inset-0 bg-black flex items-center justify-center z-50">
    <div class="w-[20rem] h-[10rem]">
      <Loading />
    </div>
  </div>
{/if}

<canvas class="w-full h-full fixed top-0 left-0" bind:this={el} />