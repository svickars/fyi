import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-netlify';

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
		trailingSlash: 'never'
	}
};

export default config;
