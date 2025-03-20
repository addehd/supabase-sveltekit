<script lang="ts">
  import { onMount } from 'svelte';
  import { createScene, loadSmileyFaceWrapper, removeSmileyFaceWrapper } from '$lib/main';
  import Loading from '$lib/components/Loading.svelte';
  import { audioSource } from '$lib/state/art-info';
  import { videoElement } from '$lib/state/video-store';
  import Footer from '$lib/components/Footer.svelte';
  import { isMenuOpen } from '$lib/state/menu-store';
  import SmileyButton from '$lib/components/SmileyButton.svelte';
  import ArtworkDescription from '$lib/components/ArtworkDescription.svelte';
  import { artworkLoaded } from '$lib/stores/loading-store';

  export let data;

  let canvas;
  let audio;
  let iframeElement: HTMLIFrameElement;
  let showDescModal = false;
  let sceneLoaded = false;
  let audioLoaded = false;

  $: { if (audio) { audio.src = $audioSource; } }

  $: if (sceneLoaded && audioLoaded) {
    $artworkLoaded = true;
  }

  onMount(() => {
    $artworkLoaded = false;
    
    createScene(canvas, data.artworks);
    
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(() => {
          sceneLoaded = true;
        }, 5000);
      });
    });

    audio = new Audio($audioSource);
    audio.addEventListener('canplaythrough', () => {
      audioLoaded = true;
    });
    audio.addEventListener('ended', () => {
      removeSmileyFaceWrapper();
    });
  });
  
  $: if (iframeElement) { $videoElement = iframeElement; }

  function toggleDescModal() {
    showDescModal = !showDescModal;
  }

  const requestPointerLock = async (event) => {
    await canvas.requestPointerLock({
      unadjustedMovement: true,
    });
  };
  
</script>

<div class="hidden sm:flex fixed backdrop-blur-lg bottom-0 w-full z-50 items-center justify-between border-t-[1px] border-white/20 
  {$isMenuOpen ? 'block' : 'hidden'} md:block">
    <nav class="flex  space-x-[20rem] justify-between w-full items-center">
      <div class="flex space-x-2 ml-11">
        <SmileyButton 
          loadSmiley={loadSmileyFaceWrapper}
          removeSmiley={removeSmileyFaceWrapper}
        />
      </div>
    

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
  
  <canvas class="w-full h-full fixed top-0 left-0" bind:this={canvas} on:click|preventDefault|stopPropagation={requestPointerLock} />

  <ArtworkDescription />
    
  <Loading />
  <Footer />