import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import adapter from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: [vitePreprocess()],

	kit: {
		// Add the Vercel adapter here
		adapter: adapter()
	},

	// vitePlugin: {
	// 	experimental: {
	// 		inspector: true
	// 	}
	// }
};

export default config;