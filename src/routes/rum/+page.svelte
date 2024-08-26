<script>
  import { onMount } from 'svelte';
  import { createScene } from '$lib/scene';
  export let data;
  let imageUrl = data.artworks[0].image_url
  console.log(imageUrl)

	let el;

	onMount(() => {
		createScene(el, imageUrl);
	});
</script>

<canvas bind:this={el} />