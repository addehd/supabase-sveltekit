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
  import { getDeviceAndOrientation, shouldShowRotationMessage } from '$lib/helper';
  import UserGuide from '$lib/components/UserGuide.svelte';

  export let data;

  const moduleMap = {
    'stappen': () => import('$lib/stappen'),
    'rum': () => import('$lib/main')
  };

  const routeConfig = {
    'stappen': {
      nextRoute: '/hangaren/32',
      nextText: 'Hangaren',
      gradientClasses: 'from-purple-500 to-purple-800'
    },
    'rum': {
      nextRoute: '/stappen/20',
      nextText: 'Stäppen',
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
  let showRotationMessage = false;
  let cleanupOrientationListener: (() => void) | null = null;

  $: { if (audio) { audio.src = $audioSource; } }

  $: if (sceneLoaded && audioLoaded) {
    $artworkLoaded = true;
  }

  $: if (iframeElement) { $videoElement = iframeElement; }

  let isMobile = false;

  onMount(async () => {

    isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)



    $artworkLoaded = false;
    
    // check orientation initially
    showRotationMessage = shouldShowRotationMessage();
    
    const { addOrientationListener } = getDeviceAndOrientation();
    cleanupOrientationListener = addOrientationListener(() => {
      showRotationMessage = shouldShowRotationMessage();
    });
    
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

    return () => {
      if (cleanupOrientationListener) cleanupOrientationListener();
    };
  });

  const requestPointerLock = async (event) => {
    await canvas.requestPointerLock({
      unadjustedMovement: true,
    });
  };
  
  const loadSmiley = () => {
    if (routeModule) routeModule.loadSmileyFaceWrapper();
  };
  
  const removeSmiley = () => {
    if (routeModule) routeModule.removeSmileyFaceWrapper();
  };
</script>

<UserGuide />

{#if showRotationMessage}
  <div class="fixed inset-0 bg-black z-[5000] flex items-center justify-center text-white">
    <div class="text-center p-4">
      <svg class="w-16 h-16 mx-auto mb-4 animate-pulse" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path fill="currentColor" d="M7 1h10a2 2 0 0 1 2 2v18a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2zm0 2v18h10V3H7zm5 15a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
      </svg>
      <p class="font-bold text-xl">please rotate your device</p>
      <p class="text-sm mt-2">this experience works best in landscape mode</p>
    </div>
  </div>
{/if}

{#if !isMobile}
<div class="hidden sm:flex fixed backdrop-blur-lg bottom-0 w-full z-50 items-center justify-between border-t-[1px] border-white/20 
  {$isMenuOpen ? 'block' : 'hidden'} md:block">
  <nav class="flex space-x-[20rem] justify-end w-full"> <div class="text-white bg-gradient-to-r {config.gradientClasses} font-bold text-xl py-7 right-0"> <a class="px-11 flex items-center gap-1" href={config.nextRoute} data-sveltekit-reload>
     {config.nextText} <svg class="w-9 h-9" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path stroke="currentColor" fill="none" stroke-width="1.5" d="M14 6l6 6-6 6" /> </svg> </a> </div> </nav>
</div>
{/if}
  
<canvas class="w-full h-full fixed top-0 left-0" bind:this={canvas} on:click|preventDefault|stopPropagation={requestPointerLock} />

<SmileyButton 
  loadSmiley={loadSmiley}
  removeSmiley={removeSmiley}/>

<ArtworkDescription />
  
<Loading />
<Footer />
