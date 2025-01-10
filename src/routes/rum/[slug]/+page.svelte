<script lang="ts">
  import {
    onMount
  } from 'svelte';
  import {
    createScene,
    loadSmileyFaceWrapper
  } from '$lib/main';
  import Loading from '$lib/components/Loading.svelte';
  import {
    description,
    audioSource,
    updateDescription,
    updateAudioSource,
    videoIsPlaying
  } from '$lib/state/art-info';
  import {
    videoElement
  } from '$lib/stores/video-store';
  import Footer from '$lib/components/Footer.svelte';

  export let data;

  let el;
  let showDiv = true;
  let audio;
  let iframeElement: HTMLIFrameElement;

  $: { if (audio) { audio.src = $audioSource; } }

  function playAndLoad() {
    loadSmileyFaceWrapper();
    if (audio) {
      audio.play();
    }
  }

  onMount(() => {
    createScene(el, data.artworks);

    setTimeout(() => {
      showDiv = false;
    }, 1000);

    const svgs = document.querySelectorAll('svg');
    svgs.forEach(svg => {
      svg.classList.add('active');
    });

    audio = new Audio($audioSource);
  });

  // bind iframe to store
  $: if (iframeElement) {
    $videoElement = iframeElement;
  }

  const handleClick = async (event) => {
    await el.requestPointerLock({
      unadjustedMovement: true,
    });
  };

  function toggleVideo() {
    $videoIsPlaying = !$videoIsPlaying;
  }

</script>


<canvas class="w-full h-full fixed top-0 left-0" bind:this={el} on:click|preventDefault|stopPropagation={handleClick} />

<Footer />

{#if showDiv}
  <div class="fixed inset-0 bg-black flex items-center justify-center z-50">
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

  .icon {
    transition: opacity 0.3s ease;
  }
  .hidden {
    opacity: 0;
    pointer-events: none;
  }
</style>