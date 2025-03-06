import adapterNode from '@sveltejs/adapter-node';
import adapterVercel from '@sveltejs/adapter-vercel';
import adapterNetlify from '@sveltejs/adapter-netlify';
import { vitePreprocess } from '@sveltejs/kit/vite';

const target = process.env.ADAPTER || 'node';

const adapters = {
	node: adapterNode({ out: 'build' }),
	vercel: adapterVercel(),
	netlify: adapterNetlify()
};

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapters[target]
	}
};

export default config;