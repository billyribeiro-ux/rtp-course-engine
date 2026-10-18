import type { Handle } from '@sveltejs/kit/hooks';

/**
 * The two font files every page renders above the fold: Montserrat for body and navigation text,
 * Poppins Bold for the page heading. SvelteKit preloads JS and CSS but not fonts, so without this
 * they only start once the stylesheet has arrived (svelte.dev/docs/kit/performance, Fonts). Other
 * subsets and Poppins SemiBold still load on demand, when a page actually uses them.
 */
const CRITICAL_FONTS: ReadonlySet<string> = new Set([
	'node_modules/@fontsource-variable/montserrat/files/montserrat-latin-wght-normal.woff2',
	'node_modules/@fontsource/poppins/files/poppins-latin-700-normal.woff2'
]);

export const handle: Handle = ({ event, resolve }) =>
	resolve(event, {
		// SvelteKit's default preloads js and css only; keep that and add the critical fonts.
		preload: (file) =>
			file.type === 'font' ? CRITICAL_FONTS.has(file.filename) : file.type !== 'asset'
	});
