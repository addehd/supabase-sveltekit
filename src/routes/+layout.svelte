<script>
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import "../app.css";
	import { isMenuOpen } from '$lib/state/menu-store';
	export let data;
	
	$: ({ session, supabase } = data);

	// toggle the menu state
	function toggleMenu() {
		$isMenuOpen = !$isMenuOpen;
	}

	onMount(() => {
		const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
			if (newSession?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth'); }
		});

		return () => data.subscription.unsubscribe();
	});

</script>

<header class="fixed backdrop-blur-lg top-0 w-full z-50 flex items-center justify-between border-b-[1px] border-white/20 
  {$isMenuOpen ? 'block' : 'hidden'} md:block">
  <nav class="flex  space-x-[20rem] px-11 justify-between w-full items-center">
    <div>
				<p class="text-white text-xl">Välkommen</p>
    </div>
    <div class="flex space-x-2">
      <img src="/logo.svg" alt="logo" class="my-5 h-[3rem] text-center" />
    </div>
    <div class="text-white text-xl py-7 left-0">
			 <a href="/stappen/34">cfuk.nu</a>
    </div>
  </nav>
</header>

<!-- hamburger button added to layout -->
<button class="rotate-90 fixed top-4 left-4 z-[60] md:hidden text-white p-2" on:click={toggleMenu}>
	<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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