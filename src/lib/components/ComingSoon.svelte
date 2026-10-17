<script lang="ts">
	interface Props {
		/** The page's name, shown as its heading and in the browser tab. */
		title: string;
	}

	let { title }: Props = $props();
</script>

<svelte:head>
	<title>{title} | Revolution Trading Pros</title>
	<!-- Placeholder pages stay out of search results until they have real content. -->
	<meta name="robots" content="noindex" />
</svelte:head>

<section class="coming-soon wrapper">
	<h1>{title}</h1>
	<p>This page is being built.</p>
</section>

<style>
	@layer components {
		.coming-soon {
			padding-block: var(--space-2xl);

			& h1 {
				font-size: var(--step-4);
			}

			& p {
				margin-block-start: var(--space-xs);
				color: var(--color-text-muted);
			}
		}
	}
</style>
