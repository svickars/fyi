const tailwindcss = require('tailwindcss');
const tailwindNesting = require('tailwindcss/nesting');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

const mode = process.env.NODE_ENV;
const dev = mode === 'development';

const config = {
	plugins: [
		tailwindNesting(),
		tailwindcss(),
		autoprefixer(),
		!dev &&
			cssnano({
				preset: 'default'
			})
	]
};

module.exports = config;
