<script lang="ts">
  import { onMount } from 'svelte';
  import { createScene, loadSmileyFaceWrapper, removeSmileyFaceWrapper } from '$lib/stappen';
  import { isMenuOpen } from '$lib/state/menu-store';
  import { artworkLoaded } from '$lib/stores/loading-store';
  import { audioSource } from '$lib/state/art-info';
  import Loading from '$lib/components/Loading.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import SmileyButton from '$lib/components/SmileyButton.svelte';
  import ArtworkDescription from '$lib/components/ArtworkDescription.svelte';
  import { writable } from 'svelte/store';
  
  export let data;
  
  let canvas;
  let audio;
  let showDescModal = false;

  $: { if (audio) { audio.src = $audioSource; } }
  


  onMount(() => {
    $artworkLoaded = false;
    
    createScene(canvas, data.artworks);

    audio = new Audio($audioSource);
    audio.addEventListener('ended', () => {
      removeSmileyFaceWrapper();
    });

    setTimeout(() => {
      $artworkLoaded = true;
    }, 1500);
  });
    
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
    
      <ArtworkDescription />

      <div class="text-white bg-gradient-to-r from-purple-500 to-purple-800 font-bold text-xl py-7 left-0">
        <a class="px-11 flex items-center gap-1" href="/rum/32" data-sveltekit-reload>
          till Hangaren
          <svg class="w-9 h-9" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path stroke="currentColor" fill="none" stroke-width="1.5" d="M14 6l6 6-6 6" />
          </svg>
        </a>
      </div>
    </nav>
  </div>
<canvas class="w-full h-full fixed top-0 left-0" bind:this={canvas} on:click|preventDefault|stopPropagation={requestPointerLock} />

<Footer />
<Loading />
<ArtworkDescription />
