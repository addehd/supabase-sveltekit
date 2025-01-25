<script>
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import "../app.css";
	export let data;
	
	$: ({ session, supabase } = data);

	onMount(() => {
		const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
			if (newSession?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth'); }
		});

		return () => data.subscription.unsubscribe();
	});

</script>

<header class="fixed backdrop-blur-lg top-0 w-full z-50 flex items-center justify-between border-b-[1px] border-white/20">
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

<main class="dark:bg-gray-900 bg-slate-800 min-h-[100vh]">i
	<slot />
</main>