<script>
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import "../app.css";
	import { videoIsPlaying } from '$lib/state/art-info';
	export let data;
	$: ({ session, supabase } = data);

	onMount(() => {
		const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
			if (newSession?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
  		}
		});

		return () => data.subscription.unsubscribe();
	});

	// logic for handling clicks
	const handleClick = async (event) => {
		await el.requestPointerLock({
			unadjustedMovement: true,
		});
	};

	function toggleVideo() {
		$videoIsPlaying = !$videoIsPlaying;
	}
	
	function playAndLoad() {
		$videoIsPlaying = true;
	}

	let isFilledIconVisible = false;

function showFilledIcon() {
	isFilledIconVisible = true;
}

function showOutlineIcon() {
	isFilledIconVisible = false;
}
</script>

<header class="fixed backdrop-blur-lg top-0 w-full z-50 flex items-center justify-between border-b-[1px] border-white/20">
  <nav class="flex  space-x-[20rem] justify-between w-full items-center">
    <div>
      <div class="hover:cursor-pointer ml-10" on:mouseenter={showFilledIcon} on:mouseleave={showOutlineIcon}>
        <svg
          id="filled-icon"
          xmlns="http://www.w3.org/2000/svg"
          width="54"
          height="54"
					stroke-width="1.1"
          viewBox="0 0 24 24"
          fill="currentColor"
          class="icon icon-tabler icons-tabler-filled icon-tabler-info-circle text-white"
          class:hidden={!isFilledIconVisible}
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M12 2c5.523 0 10 4.477 10 10a10 10 0 0 1 -19.995 .324l-.005 -.324l.004 -.28c.148 -5.393 4.566 -9.72 9.996 -9.72zm0 9h-1l-.117 .007a1 1 0 0 0 0 1.986l.117 .007v3l.007 .117a1 1 0 0 0 .876 .876l.117 .007h1l.117 -.007a1 1 0 0 0 .876 -.876l.007 -.117l-.007 -.117a1 1 0 0 0 -.764 -.857l-.112 -.02l-.117 -.006v-3l-.007 -.117a1 1 0 0 0 -.876 -.876l-.117 -.007zm.01 -3l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007z" />
        </svg>
        <svg
          id="outline-icon"
          xmlns="http://www.w3.org/2000/svg"
          width="55"
          height="55"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.1"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="icon icon-tabler icons-tabler-outline icon-tabler-info-circle text-white"
          class:hidden={isFilledIconVisible}
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
          <path d="M12 9h.01" />
          <path d="M11 12h1v4h1" />
        </svg>
      </div>
    </div>
    <div class="flex space-x-2">
      <!-- <p class="text-white marquee">{ $description }</p> -->
      <img src="/logo.svg" alt="logo" class="my-5 h-[3rem] text-center" />
    </div>
    <div class="text-white font-bold text-xl py-7 left-0">
      <!-- <a class="px-11 flex items-center gap-1" href="/stappen/34">
        CFUK Centrum för konst och kultur
        <!-- <svg class="w-9 h-9" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path stroke="currentColor" fill="none" stroke-width="1.5" d="M14 6l6 6-6 6" />
        </svg> 
      </a> -->
    </div>
  </nav>
</header>

<main class="dark:bg-gray-900 min-h-[100vh]">
	<slot />
</main>

<!-- bottom nav -->
<!-- <div class="fixed backdrop-blur-lg bottom-0 w-full z-50 flex items-center justify-between border-t-[1px] border-white/20">
	<nav class="flex space-x-[20rem] justify-between w-full items-center">
		<div class="flex space-x-2 ml-32">
			<button class="text-white font-bold text-xl h-[3rem] pl-44 hover:cursor-pointer smile" on:click={playAndLoad}
				on:keydown={(e)=> e.key === 'Enter' && playAndLoad()}>
				<svg class="h-[3.5rem] inline-block ml-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
					<circle fill="white" stroke="black" stroke-width="1.3" cx="36" cy="40.2" r="5" />
					<circle fill="white" stroke="black" stroke-width="1.3" cx="64" cy="40.2" r="5" />
					<path fill="white" stroke="black" stroke-width="1.3"
						d="M50 10c-22.1 0-40 17.9-40 40s17.9 40 40 40 40-17.9 40-40-17.9-40-40-40zm0 74.4C31 84.4 15.6 69 15.6 50S31 15.6 50 15.6 84.4 31 84.4 50 69 84.4 50 84.4z" />
					<path fill="white" stroke="black" stroke-width="1.3"
						d="M63.5 59.5c-7.4 7.4-19.6 7.4-27 0-1.1-1.1-2.9-1.1-3.9 0-1.1 1.1-1.1 2.9 0 3.9 4.8 4.8 11.1 7.2 17.5 7.2s12.6-2.4 17.5-7.2c1.1-1.1 1.1-2.9 0-3.9-1.2-1.1-3-1.1-4.1 0z" />
				</svg>
			</button>
		</div>
		<div class="text-white bg-green-600 font-bold text-xl py-7 left-0">
			<a class="px-11 flex items-center gap-1" href="/stappen/20">
				till Stäppen
				<svg class="w-9 h-9" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
					<path stroke="currentColor" fill="none" stroke-width="1.5" d="M14 6l6 6-6 6" />
				</svg>
			</a>
		</div>
	</nav>
</div> -->