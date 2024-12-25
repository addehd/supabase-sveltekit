<script>
  import { onMount } from 'svelte';
  import { createScene } from '$lib/test';

  export let artworks;

  let el;

  const handleClick = async (event) => {
    await el.requestPointerLock({
      unadjustedMovement: true,
    });
  };

  onMount(() => {
    createScene(el, artworks);
  });
</script>

<!-- <canvas 
  class="w-full h-full fixed top-0 left-0" 
  bind:this={el}
  on:click|preventDefault|stopPropagation={handleClick}
/> -->