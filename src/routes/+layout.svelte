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
</script>

<header class="fixed backdrop-blur-lg top-0 w-full z-50 flex items-center justify-between border-b-[1px] border-white/20">
	<nav class="flex space-x-[20rem] justify-between w-full items-center">
		<div></div>
		<div class="flex space-x-2">
			<img src="/logo.svg" alt="logo" class="my-5 h-[3rem] text-center" />
		</div>
		<div class="text-white font-bold text-xl py-7 left-0">
			<!-- <a class="px-11 flex items-center gap-1" href="/stappen/34">
				CFUK Centrum för konst och kultur
			</a> -->
		</div>
	</nav>
</header>

<main class="dark:bg-gray-900 min-h-[100vh]">
	<slot />
</main>

<!-- bottom nav -->
<div class="fixed backdrop-blur-lg bottom-0 w-full z-50 flex items-center justify-between border-t-[1px] border-white/20">
	<nav class="flex space-x-[20rem] justify-between w-full items-center">
		<div class="flex space-x-2 ml-32">
			<button class="text-white font-bold text-xl h-[3rem] pl-44 hover:cursor-pointer smile" on:click={playAndLoad}
				on:keydown={(e)=> e.key === 'Enter' && playAndLoad()}>
				<svg class="h-[3rem] inline-block ml-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
					<circle fill="white" cx="36" cy="40.2" r="5" />
					<circle fill="white" cx="64" cy="40.2" r="5" />
					<path fill="white"
						d="M50 10c-22.1 0-40 17.9-40 40s17.9 40 40 40 40-17.9 40-40-17.9-40-40-40zm0 74.4C31 84.4 15.6 69 15.6 50S31 15.6 50 15.6 84.4 31 84.4 50 69 84.4 50 84.4z" />
					<path fill="white"
						d="M63.5 59.5c-7.4 7.4-19.6 7.4-27 0-1.1-1.1-2.9-1.1-3.9 0-1.1 1.1-1.1 2.9 0 3.9 4.8 4.8 11.1 7.2 17.5 7.2s12.6-2.4 17.5-7.2c1.1-1.1 1.1-2.9 0-3.9-1.2-1.1-3-1.1-4.1 0z" />
				</svg>
			</button>
		</div>
		<div class="text-white bg-green-600 font-bold text-xl py-7 left-0">
			<a class="px-11 flex items-center gap-1" href="/stappen/34">
				till Stäppen
				<svg class="w-9 h-9" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
					<path stroke="currentColor" fill="none" stroke-width="1.5" d="M14 6l6 6-6 6" />
				</svg>
			</a>
		</div>
	</nav>
</div>