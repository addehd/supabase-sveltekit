<script>
  import { onMount } from 'svelte';
  import { createScene } from '$lib/solo';

  export let data;

  let el;
  let showDiv = true;

  onMount(() => {
    createScene(el, data.artworks);
    setTimeout(() => {
      showDiv = false;
    }, 1000);

    const svgs = document.querySelectorAll('svg');
    svgs.forEach(svg => {
      svg.classList.add('active');
    });
  });
</script>

<canvas 
  class="w-full h-full fixed top-0 left-0" 
  bind:this={el} />

<header class="fixed bottom-0 w-full p-9 z-50">
  <div class="bg-gray-900/25 backdrop-blur-lg absolute inset-0"></div>

  <div class="hidden sm:flex fixed backdrop-blur-lg bottom-0 w-full z-50 items-center justify-between border-t-[1px] border-white/20 md:block pointer-events-auto">
    <nav class="flex space-x-[20rem] justify-end w-full pointer-events-auto"> 
      <div class="text-white min-w-[17rem] bg-gradient-to-r from-blue-500 to-purple-500 font-bold text-xl py-7 right-0 pointer-events-auto"> 
        <a class="px-11 flex items-center gap-1 z-[5000] pointer-events-auto cursor-pointer" 
           href="#" 
           on:click|preventDefault={() => history.back()}>
          Back <svg class="w-9 h-9" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> 
            <path stroke="currentColor" fill="none" stroke-width="1.5" d="M14 6l6 6-6 6" /> 
          </svg> 
        </a> 
      </div> 
    </nav>
  </div>
</header>