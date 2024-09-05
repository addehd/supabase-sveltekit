<script>
  import { onMount } from 'svelte';
  import { createScene, playBirdsSound } from '$lib/main';
  
  export let data;
  let imageUrl = data.artworks[0].image_url;
  let el;

  onMount(() => {
    createScene(el, imageUrl); });

</script>

<header class="bg-purple-400 fixed bottom-0 w-full  p-4">
  <nav class="flex space-x-24 justify-between">
    <div class="text-white font-bold text-xl">
      Rum
    </div>
    <ul class="flex space-x-4 items-center">
      <li><a href="/" class="text-white hover:text-gray-200">home</a></li>
      <li><a href="/exhibitions" class="text-white hover:text-gray-200">exhibitions</a></li>
      <li><a href="/rum" class="text-white hover:text-gray-200">about</a></li>
      <li>
        <button on:click={playBirdsSound} class="ml-20 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">
          Play
        </button>
      </li>
    </ul>
  </nav>
</header>
    
<canvas bind:this={el} />