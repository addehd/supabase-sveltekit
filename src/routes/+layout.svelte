<script>
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import "../app.css";
	import { isMenuOpen } from '$lib/state/menu-store';
	import { writable } from 'svelte/store';
	
	export let data;
	
	$: ({ session, supabase } = data);

	// toggle the menu state
	function toggleMenu() {
		$isMenuOpen = !$isMenuOpen;
	}
	
	// create a store for info overlay state
	const isInfoOpen = writable(false);
	
	// toggle the info overlay
	function toggleInfo() {
		$isInfoOpen = !$isInfoOpen;
	}

	let isMobile = false;

	onMount(() => {
		// check for mobile only in browser
		isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

		const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
			if (newSession?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		return () => data.subscription.unsubscribe();
	});

</script>

<!-- info overlay -->
{#if $isInfoOpen}
	<div class="fixed inset-0 z-[600] flex items-center justify-center" role="dialog" aria-modal="true">
  	<button class="absolute inset-0 w-full h-full backdrop-blur-md" on:click={toggleInfo} aria-label="Close information overlay"></button>
		<div class="relative p-8 rounded-lg max-w-3xl flex-row flex gap-x-40">
				<img src="/urban.png" alt="logo" class="my-5 h-[5rem] text-center" />
				<img src="/logo.svg" alt="logo" class="my-5 h-[3.5rem] text-center" />
				<img src="/cfuk.svg" alt="logo" class="my-5 h-[3.3rem] text-center" />
		</div>
	</div>
{/if}

{#if !isMobile}
	<header class="hidden md:fixed md:block md:z-[500] md:backdrop-blur-lg md:top-0 md:w-full md:h-24 md:border-b-[1px] md:border-white/20">
		<nav class="relative w-full h-full">
			<div class="absolute left-11 top-1/2 -translate-y-1/2">
				<div></div>
			</div>
			<div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
				<img src="/logo.svg" alt="logo" class="h-[3rem]" />
			</div>
			<div class="absolute right-11 top-1/2 -translate-y-1/2 text-white text-xl">
				<a href="https://cfuk.nu">cfuk.nu</a>
			</div>
		</nav>
	</header>
{/if}

<!-- mobile header -->
<header class="md:hidden fixed z-[500] backdrop-blur-lg top-0 w-full flex items-center justify-between border-b-[1px] border-white/20 
  {$isMenuOpen ? 'h-full' : 'h-28'}">
  <nav class="flex space-x-[20rem] px-11 justify-between w-full items-center">
  </nav>
</header>

<!-- menu btn -->
<button class="fixed top-4 md:hidden right-4 z-[600] text-white p-2" on:click={toggleMenu}>
	<svg class="w-8 h-9 sm:w-12 sm:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		{#if $isMenuOpen}
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
		{:else}
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
		{/if}
	</svg>
</button>

<main class="dark:bg-gray-900 bg-slate-800 min-h-[100vh]">i
	<slot />
</main>