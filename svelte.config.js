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
			plugins: [svg()],
			resolve: {
				alias: {
					$actions: path.resolve('./src/actions'),
					$components: path.resolve('./src/components'),
					$data: path.resolve('./src/data'),
					$stores: path.resolve('./src/stores'),
					$utils: path.resolve('./src/utils')
				}
			}
		}
	}
};

export default config;
