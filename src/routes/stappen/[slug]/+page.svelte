<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { createScene, loadSmileyFaceWrapper, removeSmileyFaceWrapper } from '$lib/stappen';
  import { isMenuOpen } from '$lib/state/menu-store';
  import { artworkLoaded } from '$lib/stores/loading-store';
  import Loading from '$lib/components/Loading.svelte';
  
  import SmileyButton from '$lib/components/SmileyButton.svelte';
  import ArtworkDescription from '$lib/components/ArtworkDescription.svelte';

  export let data;
  
  const requestPointerLock = async (event) => {
    await el.requestPointerLock({
      unadjustedMovement: true,
    });
  };
  
  let el;
  onMount(() => {
    createScene(el, data.artworks); 
    $artworkLoaded = true;
  });

</script>

<canvas class="w-full h-full fixed top-0 left-0" 
  bind:this={el}
  on:click|preventDefault|stopPropagation={requestPointerLock} />

<!-- bottom nav -->
<div class="fixed backdrop-blur-lg bottom-0 w-full z-50 flex items-center justify-between border-t-[1px] border-white/20
  {$isMenuOpen ? 'block' : 'hidden'} md:block">
  <nav class="flex  space-x-[20rem] justify-between w-full items-center">

    <!-- smile btn -->
    <div class="flex space-x-2 ml-32">
      <SmileyButton 
        loadSmiley={loadSmileyFaceWrapper}
        removeSmiley={removeSmileyFaceWrapper}
      />
    </div>

    <!-- next exhibition -->
    <div class="text-white bg-gradient-to-r from-orange-500 to-orange-700 font-bold text-xl py-7 left-0">
      <a class="px-11 flex items-center gap-1" href="/rum/32" data-sveltekit-reload>
          Hangaren
        <svg class="w-9 h-9" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path stroke="currentColor" fill="none" stroke-width="1.5" d="M14 6l6 6-6 6" />
        </svg>
      </a>
    </div>
  </nav>
</div>

<Loading />

<ArtworkDescription />
