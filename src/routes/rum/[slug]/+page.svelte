<script lang="ts">
  import { onMount } from 'svelte';
  import { createScene, loadSmileyFaceWrapper, removeSmileyFaceWrapper } from '$lib/main';
  import Loading from '$lib/components/Loading.svelte';
  import { description, audioSource, name, updateDescription, updateAudioSource, updateName, videoIsPlaying } from '$lib/state/art-info';
  import { videoElement } from '$lib/state/video-store';
  import Footer from '$lib/components/Footer.svelte';
  import { getSystemInfo } from '$lib/helpers';
  import { isMenuOpen } from '$lib/state/menu-store';
  import FormattedText from '$lib/components/FormattedText.svelte';
  import SmileyButton from '$lib/components/SmileyButton.svelte';
  import ArtworkDescription from '$lib/components/ArtworkDescription.svelte';

  export let data;

  let canvas;
  let showDiv = true;
  let audio;
  let iframeElement: HTMLIFrameElement;
  let showDescModal = false;

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  $: { if (audio) { audio.src = $audioSource; } }
  
  function playAndLoad() {
    if (audio.paused) {
      audio.play();
      loadSmileyFaceWrapper();
    } else {
      audio.pause();
      removeSmileyFaceWrapper();
    }
  }
  
  onMount(() => {
    createScene(canvas, data.artworks);
    setTimeout(() => {
      showDiv = false;
    }, 0);
    const svgs = document.querySelectorAll('svg');
    svgs.forEach(svg => {
      svg.classList.add('active');
    });
    audio = new Audio($audioSource);
    
    // add event listener for when audio ends
    audio.addEventListener('ended', () => {
      removeSmileyFaceWrapper();
      // audio ended naturally
    });
    
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

  function toggleDescModal() {
    showDescModal = !showDescModal;
  }
</script>

{#if !isMobile}
<div class="fixed backdrop-blur-lg bottom-0 w-full z-50 flex items-center justify-between border-t-[1px] border-white/20 
  {$isMenuOpen ? 'block' : 'hidden'} md:block">
  <nav class="flex  space-x-[20rem] justify-between w-full items-center">
    <div class="flex space-x-2 ml-11">
      <SmileyButton 
        loadSmiley={loadSmileyFaceWrapper}
        removeSmiley={removeSmileyFaceWrapper}
      />
    </div>
    
    <ArtworkDescription />
    
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

<canvas class="w-full h-full fixed top-0 left-0" bind:this={canvas} on:click|preventDefault|stopPropagation={handleClick} />

<Footer />

{#if showDiv}
<div class="fixed inset-0 bg-black flex items-center justify-center z-[720]">
  <div class="w-[20rem] h-[10rem]">
    <Loading />
  </div>
</div>
{/if}

