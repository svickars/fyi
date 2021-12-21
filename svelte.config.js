import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-netlify';
import svg from '@poppanator/sveltekit-svg';

const config = {
	preprocess: [
		preprocess({
			postcss: true,
			globalStyle: true
		})
	],
	kit: {
		adapter: adapter(),
		target: '#svelte',
		vite: {
			plugins: [svg()]
		}
	}
};

export default config;
