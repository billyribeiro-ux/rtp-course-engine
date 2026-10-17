<script lang="ts" module>
	/*
	 * Bold glyphs from Phosphor Icons (phosphoricons.com), MIT License, Copyright (c) 2020 Phosphor
	 * Icons; full notice in PHOSPHOR-LICENSE beside this file. They are inlined rather than imported
	 * from phosphor-svelte because SvelteKit advises against icon libraries that ship a .svelte file
	 * per icon, which slow Vite's dependency optimization (svelte.dev/docs/kit/icons).
	 */
	const PATHS = {
		'caret-down':
			'M216.49,104.49l-80,80a12,12,0,0,1-17,0l-80-80a12,12,0,0,1,17-17L128,159l71.51-71.52a12,12,0,0,1,17,17Z',
		list: 'M228,128a12,12,0,0,1-12,12H40a12,12,0,0,1,0-24H216A12,12,0,0,1,228,128ZM40,76H216a12,12,0,0,0,0-24H40a12,12,0,0,0,0,24ZM216,180H40a12,12,0,0,0,0,24H216a12,12,0,0,0,0-24Z',
		user: 'M234.38,210a123.36,123.36,0,0,0-60.78-53.23,76,76,0,1,0-91.2,0A123.36,123.36,0,0,0,21.62,210a12,12,0,1,0,20.77,12c18.12-31.32,50.12-50,85.61-50s67.49,18.69,85.61,50a12,12,0,0,0,20.77-12ZM76,96a52,52,0,1,1,52,52A52.06,52.06,0,0,1,76,96Z',
		x: 'M208.49,191.51a12,12,0,0,1-17,17L128,145,64.49,208.49a12,12,0,0,1-17-17L111,128,47.51,64.49a12,12,0,0,1,17-17L128,111l63.51-63.52a12,12,0,0,1,17,17L145,128Z'
	} as const;

	export type IconName = keyof typeof PATHS;
</script>

<script lang="ts">
	interface Props {
		name: IconName;
	}

	let { name }: Props = $props();
</script>

<!-- Decorative: the control around it carries the name. Sized by font-size, coloured by the text. -->
<svg viewBox="0 0 256 256" width="1em" height="1em" fill="currentColor" aria-hidden="true">
	<path d={PATHS[name]} />
</svg>
