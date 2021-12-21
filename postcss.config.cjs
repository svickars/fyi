const tailwindcss = require('tailwindcss');
const tailwindNesting = require('tailwindcss/nesting');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
// const pxtorem = require('postcss-pxtorem');
// const easings = require('postcss-easings');
// const nesting = require('postcss-nesting');
const mode = process.env.NODE_ENV;
const dev = mode === 'development';

const config = {
	plugins: [
		// nesting(),
		// easings(),
		tailwindNesting(),
		tailwindcss(),
		// pxtorem(),
		autoprefixer(),
		!dev &&
			cssnano({
				preset: 'default'
			})
	]
};

module.exports = config;
