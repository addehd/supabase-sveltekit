<script>
  import { onMount } from 'svelte';
  import { createScene, loadSmileyFaceWrapper } from '$lib/main';
  import Loading from '$lib/components/Loading.svelte';

  export let data;

  let imageUrl = data.artworks[0].image_url;
  let el;
  let showDiv = true;
  let audio;

  function playAudio() {
    audio.play();
  }

  onMount(() => {
    if (Array.isArray(data.artworks)) {
      createScene(el, data.artworks);
    }
    
    setTimeout(() => {
      showDiv = false;
    }, 4500);

    const svgs = document.querySelectorAll('svg');
    svgs.forEach(svg => {
      svg.classList.add('active');
    });

    audio = new Audio('https://www.idell.se/wp-content/uploads/2024/10/intro-18.28.48.mp3');
  });
</script>

<header class="bg-purple-400 fixed bottom-0 w-full p-4 py-1 z-50 flex items-center justify-between">
  <nav class="flex  space-x-[20rem] justify-around w-full">
    <div class="text-white font-bold text-xl left-20 py-3">
      Hangaren 
    </div>

    <div class="flex space-x-2">
      <button
        class="text-white font-medium text-xl h-[3rem] hover:cursor-pointer"
        on:click={() => loadSmileyFaceWrapper()}>
        Play
      </button>
      <button
        class="text-white font-bold text-xl h-[3rem] hover:cursor-pointer smile"
        on:click={playAudio}
        on:keydown={(e) => e.key === 'Enter' && playAudio()}
      >
        <svg class="h-[3rem]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <circle fill="white" cx="36" cy="40.2" r="5"/>
          <circle fill="white" cx="64" cy="40.2" r="5"/>
          <path fill="white" d="M50 10c-22.1 0-40 17.9-40 40s17.9 40 40 40 40-17.9 40-40-17.9-40-40-40zm0 74.4C31 84.4 15.6 69 15.6 50S31 15.6 50 15.6 84.4 31 84.4 50 69 84.4 50 84.4z"/>
          <path fill="white" d="M63.5 59.5c-7.4 7.4-19.6 7.4-27 0-1.1-1.1-2.9-1.1-3.9 0-1.1 1.1-1.1 2.9 0 3.9 4.8 4.8 11.1 7.2 17.5 7.2s12.6-2.4 17.5-7.2c1.1-1.1 1.1-2.9 0-3.9-1.2-1.1-3-1.1-4.1 0z"/>
        </svg>
      </button>
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
