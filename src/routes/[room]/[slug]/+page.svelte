<script lang="ts">
  import { onMount } from 'svelte';
  import Loading from '$lib/components/Loading.svelte';
  import { audioSource } from '$lib/state/art-info';
  import { videoElement } from '$lib/state/video-store';
  import Footer from '$lib/components/Footer.svelte';
  import { isMenuOpen } from '$lib/state/menu-store';
  import SmileyButton from '$lib/components/SmileyButton.svelte';
  import ArtworkDescription from '$lib/components/ArtworkDescription.svelte';
  import { artworkLoaded } from '$lib/stores/loading-store';

  export let data;

  const moduleMap = {
    'stappen': () => import('$lib/stappen'),
    'rum': () => import('$lib/main')
  };

  const routeConfig = {
    'stappen': {
      nextRoute: '/stappen/20',
      nextText: 'till Hangaren',
      gradientClasses: 'from-purple-500 to-purple-800'
    },
    'rum': {
      nextRoute: '/hangaren/32',
      nextText: 'till Stäppen',
      gradientClasses: 'from-green-500 to-green-700'
    }
  };

  const config = routeConfig[data.routeParam] || routeConfig.rum;
  
  let canvas;
  let audio;
  let iframeElement: HTMLIFrameElement;
  let sceneLoaded = false;
  let audioLoaded = false;
  let routeModule;

  $: { if (audio) { audio.src = $audioSource; } }

  $: if (sceneLoaded && audioLoaded) {
    $artworkLoaded = true;
  }

  $: if (iframeElement) { $videoElement = iframeElement; }

  onMount(async () => {
    $artworkLoaded = false;
    
    const importFunc = data.routeParam && moduleMap[data.routeParam] 
      ? moduleMap[data.routeParam] 
      : moduleMap['rum'];
      
    const module = await importFunc();
    routeModule = module.default || module;
    
    routeModule.createScene(canvas, data.artworks);
    
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
      routeModule.removeSmileyFaceWrapper();
    });
  });

  const requestPointerLock = async (event) => {
    await canvas.requestPointerLock({
      unadjustedMovement: true,
    });
  };
  
  // wrapping functions to pass to components
  const loadSmiley = () => {
    if (routeModule) routeModule.loadSmileyFaceWrapper();
  };
  
  const removeSmiley = () => {
    if (routeModule) routeModule.removeSmileyFaceWrapper();
  };
</script>


<div class="hidden sm:flex fixed backdrop-blur-lg bottom-0 w-full z-50 items-center justify-between border-t-[1px] border-white/20 
  {$isMenuOpen ? 'block' : 'hidden'} md:block">
  <nav class="flex space-x-[20rem] justify-between w-full items-center">
    <div class="flex space-x-2 ml-11">
      <SmileyButton 
        loadSmiley={loadSmiley}
        removeSmiley={removeSmiley}
      />
    </div>
    
    <div class="text-white bg-gradient-to-r {config.gradientClasses} font-bold text-xl py-7 left-0">
      <a class="px-11 flex items-center gap-1" href={config.nextRoute} data-sveltekit-reload>
        {config.nextText}
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
