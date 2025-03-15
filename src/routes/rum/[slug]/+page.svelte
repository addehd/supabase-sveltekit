<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { createScene, loadSmileyFaceWrapper, removeSmileyFaceWrapper } from '$lib/main';
  import Loading from '$lib/components/Loading.svelte';
  import { description, audioSource, name, updateDescription, updateAudioSource, updateName, videoIsPlaying } from '$lib/state/art-info';
  import { videoElement } from '$lib/state/video-store';
  import Footer from '$lib/components/Footer.svelte';
  import { getSystemInfo } from '$lib/helpers';
  import { resetStores } from '$lib/state/art-info';
  import { isMenuOpen } from '$lib/state/menu-store';
  import { browser } from '$app/environment';
  import FormattedText from '$lib/components/FormattedText.svelte';

  export let data;

  let canvas;
  let showDiv = true;
  let audio;
  let iframeElement: HTMLIFrameElement;
  let showDescModal = false;

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  $: { if (audio) { audio.src = $audioSource; } }
  
  function playAndLoad() {

    if (audio) {
      if (audio.paused) {
        audio.play();
        loadSmileyFaceWrapper();
      } else {
        audio.pause();
        removeSmileyFaceWrapper();
      }
    }
  }
  
  onMount(() => {
    createScene(canvas, data.artworks);
    setTimeout(() => {
      showDiv = false;
    },   0);
    const svgs = document.querySelectorAll('svg');
    svgs.forEach(svg => {
      svg.classList.add('active');
    });
    audio = new Audio($audioSource);
    
    // log system info
    const systemInfo = getSystemInfo();
    console.log('System Information:', systemInfo);
  });
  // bind iframe to store
  $: if (iframeElement) {
    $videoElement = iframeElement;
  }
  const handleClick = async (event) => {
    await canvas.requestPointerLock({
      unadjustedMovement: true,
    });
  };
  function toggleVideo() {
    $videoIsPlaying = !$videoIsPlaying;
  }

  // add toggle function
  function toggleMenu() {
    $isMenuOpen = !$isMenuOpen;
  }

  function toggleDescModal() {
    showDescModal = !showDescModal;
  }
</script>

{#if !isMobile}
<div class="fixed backdrop-blur-lg bottom-0 w-full z-50 flex items-center justify-between border-t-[1px] border-white/20 
  {$isMenuOpen ? 'block' : 'hidden'} md:block">
  <nav class="flex  space-x-[20rem] justify-between w-full items-center">
    <div class="flex space-x-2 ml-11">
      <button class="text-white font-bold text-xl h-[3rem] hover:cursor-pointer smile" on:click={playAndLoad}
        on:keydown={(e)=> e.key === 'Enter' && playAndLoad()}>
        <svg class="h-[3rem] inline-block ml-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <circle fill="white" cx="36" cy="40.2" r="5" />
          <circle fill="white" cx="64" cy="40.2" r="5" />
          <path fill="white"
            d="M50 10c-22.1 0-40 17.9-40 40s17.9 40 40 40 40-17.9 40-40-17.9-40-40-40zm0 74.4C31 84.4 15.6 69 15.6 50S31 15.6 50 15.6 84.4 31 84.4 50 69 84.4 50 84.4z" />
          <path fill="white"
            d="M63.5 59.5c-7.4 7.4-19.6 7.4-27 0-1.1-1.1-2.9-1.1-3.9 0-1.1 1.1-1.1 2.9 0 3.9 4.8 4.8 11.1 7.2 17.5 7.2s12.6-2.4 17.5-7.2c1.1-1.1 1.1-2.9 0-3.9-1.2-1.1-3-1.1-4.1 0z" />
        </svg>
      </button>
    </div>
    
    <button on:click={toggleDescModal}>
      <p class="text-white text-xl fade-in">
        {#if $name && $name !== 'Welcome'}
          <span class="text-sm italic">by</span> {$name}
        {/if}
      </p>
    </button>

    <div class="text-white bg-gradient-to-r from-green-500 to-green-700 font-bold text-xl py-7 left-0">
      <a class="px-11 flex items-center gap-1" href="/stappen/20" data-sveltekit-reload>
        till Stäppen
        <svg class="w-9 h-9" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path stroke="currentColor" fill="none" stroke-width="1.5" d="M14 6l6 6-6 6" />
        </svg>
      </a>
    </div>
  </nav>
</div>
{/if}

{#if showDescModal}
  <div class="fixed inset-0 flex items-center justify-center z-[60]" on:click={toggleDescModal}>
    <div class="absolute backdrop-blur-lg bg-black/50 w-1/2 max-h-[50vh] overflow-auto text-white p-12 border-[1px] border-white/20 rounded-md" on:click|stopPropagation>
      <div class="relative">
        <button 
          class="absolute top-[-2rem] right-[-2rem] p-7 text-white hover:text-gray-300" 
          on:click={toggleDescModal}>
          ✕
        </button>
        <div class="text-xl font-bold mb-6">{$name || 'Artwork'}</div>
        <FormattedText text={$description || 'No description available'} />
      </div>
    </div>
  </div>
{/if}

<canvas class="w-full h-full fixed top-0 left-0" bind:this={canvas} on:click|preventDefault|stopPropagation={handleClick} />
<Footer />
{#if showDiv}
<div class="fixed inset-0 bg-black flex items-center justify-center z-[720]">
  <div class="w-[20rem] h-[10rem]">
    <Loading />
  </div>
</div>
{/if}
<style>
.glow {
  filter: drop-shadow(0 0 4px currentColor);
}
.marquee {
  white-space: nowrap;
  animation: scroll-text 230s linear infinite;
}
@keyframes scroll-text {
  from {
    transform: translateX(0%);
  }
  to {
    transform: translateX(-100%);
  }
}
</style>