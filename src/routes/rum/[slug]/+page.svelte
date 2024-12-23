<script lang="ts">
  import { onMount } from 'svelte';
  import { createScene, loadSmileyFaceWrapper } from '$lib/main';
  import Loading from '$lib/components/Loading.svelte';
  import { description, audioSource, updateDescription, updateAudioSource } from '$lib/state/art-info';
  import { videoElement } from '$lib/stores/video-store';

  export let data;

  let el;
  let showDiv = true;
  let audio;
  let iframeElement: HTMLIFrameElement;

  $: {
    console.log('audioSource:', $audioSource);
    if (audio) {
      audio.src = $audioSource;
    }
  }

  // log audioSource when it changes

  function playAndLoad() {
    loadSmileyFaceWrapper();
    if (audio) {
      audio.play();
    }
  }

  onMount(() => {
    if (Array.isArray(data.artworks)) {
      createScene(el, data.artworks);
    }
    
    setTimeout(() => {
      showDiv = false;
    }, 2500);

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

</script>

<header class="bg-purple-600/90 fixed bottom-0 h-[6rem] w-full p-9 py-1 z-50 flex items-center justify-between">
  <nav class="flex  space-x-[20rem] justify-around w-full">
    <div class="text-white font-bold text-xl left-20 py-3">
      <a href="/stappen/34">till Stäppen</a>
    </div>

    <div class="flex space-x-2">
      <button
        class="text-white font-bold text-xl h-[3rem] hover:cursor-pointer smile"
        on:click={playAndLoad}
        on:keydown={(e) => e.key === 'Enter' && playAndLoad()}>
        Spela
        <svg class="h-[3rem] inline-block ml-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
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

<canvas 
  class="w-full h-full fixed top-0 left-0" 
  bind:this={el}
  on:click|preventDefault|stopPropagation={handleClick}
/>

<footer class="bg-gray-800 text-white p-6">
  <div class="container mx-auto">
      <div class="mb-4">
          <h2 class="text-lg font-bold">Kontakt & info</h2>
          <ul class="mt-2 space-y-1">
              <li>Telefon: +46(0)707 666 122</li>
              <li>Email: <a href="mailto:info@cfuk.nu" class="text-blue-400 hover:underline">info@cfuk.nu</a></li>
              <li>
                  Instagram: <a href="https://instagram.com/Urbankonsthallen_Hangaren" target="_blank" class="text-blue-400 hover:underline">
                      Urbankonsthallen_Hangaren
                  </a>
              </li>
          </ul>
      </div>
      <div class="mb-4">
          <h2 class="text-lg font-bold">Öppettider</h2>
          <ul class="mt-2 space-y-1">
              <li>Inne i Hangaren:</li>
              <li>MÅN-FRE 07:00 – 15:00 öppnar M&M portarna.</li>
              <li>Stäppen utanför Hangaren: Alltid öppet 06.00–23.00</li>
          </ul>
      </div>
      <div class="mt-6 flex space-x-4">
          <a href="https://facebook.com" target="_blank" class="hover:text-blue-500">
              Facebook
          </a>
          <a href="https://youtube.com" target="_blank" class="hover:text-red-500">
              YouTube
          </a>
          <a href="https://instagram.com" target="_blank" class="hover:text-pink-500">
              Instagram
          </a>
      </div>
  </div>
</footer>