<script lang="ts">
	import { LOGO_ART, MARK, type LogoVariant } from './logo-art.js';

	interface Props {
		/** `nav`: mark and name. `full`: with tagline. `mark`: the gold circle alone. */
		variant?: LogoVariant;
		/** The accessible name. The wordmark is styled "RevOlution", but it is read normally. */
		title?: string;
	}

	let { variant = 'nav', title = 'Revolution Trading Pros' }: Props = $props();

	// One id per component instance, so two logos on a page never share gradient or mask ids.
	const uid = $props.id();

	const art = $derived(LOGO_ART[variant]);
</script>

<svg
	class="logo"
	data-variant={variant}
	viewBox={art.viewBox}
	role="img"
	aria-labelledby="{uid}-title"
	xmlns="http://www.w3.org/2000/svg"
>
	<title id="{uid}-title">{title}</title>
	<defs>
		<linearGradient
			id="{uid}-disc"
			gradientUnits="userSpaceOnUse"
			x1={MARK.gradient.x1}
			y1={MARK.gradient.y1}
			x2={MARK.gradient.x2}
			y2={MARK.gradient.y2}
		>
			<stop class="gold-start" offset="0" />
			<stop class="gold-end" offset="1" />
		</linearGradient>
		<linearGradient id="{uid}-dot" x1="0" y1="0.5" x2="1" y2="0.5">
			<stop class="gold-start" offset="0" />
			<stop class="gold-end" offset="1" />
		</linearGradient>
		<mask id="{uid}-cutout">
			<circle cx={MARK.disc.cx} cy={MARK.disc.cy} r={MARK.disc.r} fill="#fff" />
			<path
				d={MARK.line.d}
				fill="none"
				stroke="#000"
				stroke-width={MARK.line.width}
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
			<!-- Keyed by position: each ring sits at its own point on the chart line. -->
			{#each MARK.nodes as node (`${node.cx},${node.cy}`)}
				<circle cx={node.cx} cy={node.cy} r={MARK.ringRadius} fill="#000" />
			{/each}
		</mask>
	</defs>
	<circle
		cx={MARK.disc.cx}
		cy={MARK.disc.cy}
		r={MARK.disc.r}
		fill="url(#{uid}-disc)"
		mask="url(#{uid}-cutout)"
	/>
	{#each MARK.nodes as node (`${node.cx},${node.cy}`)}
		<circle cx={node.cx} cy={node.cy} r={MARK.dotRadius} fill="url(#{uid}-dot)" />
	{/each}
	{#if art.lettering}
		<path class="lettering" d={art.lettering} fill-rule="evenodd" />
	{/if}
</svg>

<style>
	@layer components {
		.logo {
			display: block;
			block-size: var(--logo-height, 2rem);
			inline-size: auto;
		}

		.gold-start {
			stop-color: var(--gold-start);
		}

		.gold-end {
			stop-color: var(--gold-end);
		}

		.lettering {
			fill: currentcolor;
		}
	}
</style>
