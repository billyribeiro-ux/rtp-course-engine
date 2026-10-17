import postcssGlobalData from '@csstools/postcss-global-data';
import postcssCustomMedia from 'postcss-custom-media';

/** @type {import('postcss-load-config').Config} */
const config = {
	plugins: [
		// Makes the breakpoint definitions visible to every stylesheet and component.
		postcssGlobalData({ files: ['src/lib/styles/media.css'] }),
		// Compiles `@media (--md)` into a real media query.
		postcssCustomMedia()
	]
};

export default config;
