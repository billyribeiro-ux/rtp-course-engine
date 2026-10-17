<script lang="ts">
	import '@fontsource/poppins/600.css';
	import '@fontsource/poppins/700.css';
	import '@fontsource-variable/montserrat';
	import '#lib/styles/global.css';
	import favicon from '#lib/assets/favicon.svg';
	import SiteHeader from '#lib/components/site-header/SiteHeader.svelte';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<a class="skip-link" href="#main">Skip to main content</a>
<SiteHeader />
<main id="main" tabindex="-1">
	{@render children()}
</main>

<style>
	@layer components {
		/* Hidden until a keyboard user tabs to it; then it jumps them past the header. */
		.skip-link {
			position: absolute;
			inset-block-start: 0.5rem;
			inset-inline-start: 0.5rem;
			z-index: calc(var(--layer-header) + 1);
			padding: 0.75rem 1rem;
			font-weight: var(--font-weight-bold);
			color: var(--color-on-gold);
			background-color: var(--color-gold);
			border-radius: var(--radius-m);
			translate: 0 -200%;

			&:focus-visible {
				translate: 0 0;
			}
		}
	}
</style>
