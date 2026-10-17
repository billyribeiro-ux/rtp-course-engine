<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import type { RouteId } from '$app/types';
	import type { Attachment } from 'svelte/attachments';
	import { on } from 'svelte/events';
	import Logo from '#lib/components/brand/Logo.svelte';
	import Icon from '#lib/components/icons/Icon.svelte';
	import {
		CALL_TO_ACTION,
		COMPANY_NAV,
		LOGIN_LINK,
		MAIN_NAV,
		SITE_NAV,
		type NavMenu
	} from '#lib/content/navigation.js';

	const uid = $props.id();

	/** The wide-screen menu that is open, by menu id, or null when none is. */
	let openMenu = $state<string | null>(null);
	/** Whether the phone and tablet menu panel is open. */
	let sheetOpen = $state(false);

	const buttonId = (menuId: string): string => `${uid}-${menuId}-button`;
	const panelId = (menuId: string): string => `${uid}-${menuId}-panel`;
	const sheetId = `${uid}-sheet`;

	function isCurrent(route: RouteId): boolean {
		return page.route.id === route;
	}

	/** A menu is highlighted while the visitor is on one of its pages. */
	function holdsCurrent(menu: NavMenu): boolean {
		return menu.links.some((entry) => isCurrent(entry.route));
	}

	function toggleMenu(menuId: string): void {
		openMenu = openMenu === menuId ? null : menuId;
	}

	function onDocumentKeydown(event: KeyboardEvent): void {
		if (event.key !== 'Escape' || openMenu === null) return;
		const button = document.getElementById(buttonId(openMenu));
		openMenu = null;
		button?.focus();
	}

	/** Close a wide-screen menu when keyboard focus moves out of it. */
	function onItemFocusout(event: FocusEvent, menuId: string): void {
		const item = event.currentTarget;
		const next = event.relatedTarget;
		if (openMenu !== menuId || !(item instanceof HTMLElement)) return;
		if (!(next instanceof Node) || !item.contains(next)) openMenu = null;
	}

	/** Closes the open wide-screen menu when a pointer goes down outside the main navigation. */
	const closeOnOutsidePointer: Attachment<HTMLElement> = (nav) =>
		on(document, 'pointerdown', (event) => {
			const target = event.target;
			if (openMenu !== null && target instanceof Node && !nav.contains(target)) openMenu = null;
		});

	/**
	 * Keeps the native modal dialog in step with `sheetOpen`. showModal() supplies focus trapping,
	 * Escape to close and an inert page behind; closing returns focus to the Menu button
	 * (W3C technique H102). The attachment re-runs whenever `sheetOpen` changes.
	 */
	const syncSheet: Attachment<HTMLDialogElement> = (dialog) => {
		if (sheetOpen && !dialog.open) dialog.showModal();
		if (!sheetOpen && dialog.open) dialog.close();
	};

	/** A click on the dialog element itself, outside the panel, is a click on the backdrop. */
	function onSheetClick(event: MouseEvent): void {
		if (event.target === event.currentTarget) sheetOpen = false;
	}

	afterNavigate(() => {
		openMenu = null;
		sheetOpen = false;
	});
</script>

<svelte:document onkeydown={onDocumentKeydown} />

<header class="site-header">
	<div class="topbar">
		<div class="topbar-inner wrapper">
			<nav aria-label="Company">
				<ul class="company-list" role="list">
					{#each COMPANY_NAV as item (item.label)}
						{#if item.kind === 'link'}
							<li>
								<a
									class="company-link"
									href={resolve(item.route)}
									aria-current={isCurrent(item.route) ? 'page' : undefined}>{item.label}</a
								>
							</li>
						{/if}
					{/each}
				</ul>
			</nav>
			<span class="divider" aria-hidden="true"></span>
			<a
				class="login"
				href={resolve(LOGIN_LINK.route)}
				aria-current={isCurrent(LOGIN_LINK.route) ? 'page' : undefined}
			>
				<span class="icon" aria-hidden="true"><Icon name="user" /></span>
				{LOGIN_LINK.label}
			</a>
		</div>
	</div>

	<div class="bar wrapper">
		<a class="brand" href={resolve('/')}>
			<Logo variant="nav" />
		</a>

		<nav class="main-nav" aria-label="Main" {@attach closeOnOutsidePointer}>
			<ul class="menu" role="list">
				{#each MAIN_NAV as item (item.label)}
					{#if item.kind === 'menu'}
						<li class="menu-item" onfocusout={(event) => onItemFocusout(event, item.id)}>
							<button
								id={buttonId(item.id)}
								class="menu-button"
								type="button"
								aria-expanded={openMenu === item.id}
								aria-controls={panelId(item.id)}
								data-current={holdsCurrent(item) ? '' : undefined}
								onclick={() => toggleMenu(item.id)}
							>
								{item.label}
								<span class="caret" aria-hidden="true"><Icon name="caret-down" /></span>
							</button>
							<div id={panelId(item.id)} class="dropdown" hidden={openMenu !== item.id}>
								<ul class="dropdown-list" role="list">
									{#each item.links as entry (entry.route)}
										<li>
											<a
												class="dropdown-link"
												href={resolve(entry.route)}
												aria-current={isCurrent(entry.route) ? 'page' : undefined}>{entry.label}</a
											>
										</li>
									{/each}
								</ul>
							</div>
						</li>
					{:else}
						<li class="menu-item">
							<a
								class="menu-link"
								href={resolve(item.route)}
								aria-current={isCurrent(item.route) ? 'page' : undefined}>{item.label}</a
							>
						</li>
					{/if}
				{/each}
			</ul>
		</nav>

		<a class="cta" href={resolve(CALL_TO_ACTION.route)}>{CALL_TO_ACTION.label}</a>

		<button
			class="open-sheet"
			type="button"
			aria-haspopup="dialog"
			aria-expanded={sheetOpen}
			aria-controls={sheetId}
			onclick={() => (sheetOpen = true)}
		>
			<span class="icon" aria-hidden="true"><Icon name="list" /></span>
			Menu
		</button>
	</div>

	<dialog
		id={sheetId}
		class="sheet"
		aria-label="Menu"
		{@attach syncSheet}
		onclose={() => (sheetOpen = false)}
		onclick={onSheetClick}
	>
		<div class="panel">
			<div class="panel-header">
				<a class="brand" href={resolve('/')}><Logo variant="nav" /></a>
				<!-- A form with method="dialog" closes its dialog natively, no script needed. -->
				<form method="dialog">
					<button class="close-sheet" type="submit">
						<span class="icon" aria-hidden="true"><Icon name="x" /></span>
						Close
					</button>
				</form>
			</div>

			<nav class="sheet-nav" aria-label="Main">
				{#each SITE_NAV as { item } (item.label)}
					{#if item.kind === 'menu'}
						<details class="sheet-section" name="{uid}-sections">
							<summary class="sheet-summary">
								{item.label}
								<span class="caret" aria-hidden="true"><Icon name="caret-down" /></span>
							</summary>
							<ul class="sheet-list" role="list">
								{#each item.links as entry (entry.route)}
									<li>
										<a
											class="sheet-link"
											href={resolve(entry.route)}
											aria-current={isCurrent(entry.route) ? 'page' : undefined}>{entry.label}</a
										>
									</li>
								{/each}
							</ul>
						</details>
					{:else}
						<a
							class="sheet-top-link"
							href={resolve(item.route)}
							aria-current={isCurrent(item.route) ? 'page' : undefined}>{item.label}</a
						>
					{/if}
				{/each}
			</nav>

			<div class="panel-actions">
				<a class="login-button" href={resolve(LOGIN_LINK.route)}>{LOGIN_LINK.label}</a>
				<a class="cta" href={resolve(CALL_TO_ACTION.route)}>{CALL_TO_ACTION.label}</a>
			</div>
		</div>
	</dialog>
</header>

<style>
	@layer components {
		/*
		 * Header sizes, measured against the real fonts and logo (Standards:
		 * Layout and responsiveness, Navigation). Phone first; each breakpoint
		 * below only changes these values and what is shown.
		 */
		.site-header {
			--bar-height: 4rem;
			--logo-height: 1.75rem;
			--nav-font-size: 0.875rem;
			--nav-item-padding: 0.5rem;

			position: sticky;
			inset-block-start: 0;
			z-index: var(--layer-header);
			color: var(--color-text);
			background-color: var(--color-page);
			border-block-end: var(--border-thin) solid var(--color-line);
		}

		/* ---------- Shared pieces ---------- */

		.brand {
			display: flex;
			flex-shrink: 0;
			align-items: center;
			min-block-size: var(--target-min);
			color: var(--color-text);
		}

		.icon,
		.caret {
			display: inline-flex;
			font-size: 1.125em;
		}

		.caret {
			font-size: 0.75em;
			transition: rotate var(--duration-fast) var(--ease-out);
		}

		.cta {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			min-block-size: var(--target-min);
			padding-inline: 1.25rem;
			font-weight: var(--font-weight-bold);
			color: var(--color-on-gold);
			text-decoration: none;
			white-space: nowrap;
			background-color: var(--color-gold);
			border-radius: var(--radius-m);
			transition: background-color var(--duration-fast) var(--ease-out);
		}

		/* ---------- Top bar (wide screens only) ---------- */

		.topbar {
			display: none;
			background-color: var(--color-topbar);
			border-block-end: var(--border-thin) solid var(--color-line);
		}

		.topbar-inner {
			display: flex;
			gap: 0.25rem;
			align-items: center;
			justify-content: flex-end;
		}

		.company-list {
			display: flex;
		}

		.company-link,
		.login {
			display: inline-flex;
			gap: 0.5rem;
			align-items: center;
			min-block-size: var(--target-min);
			padding-inline: 0.625rem;
			font-size: 0.875rem;
			font-weight: var(--font-weight-semibold);
			text-decoration: none;
			white-space: nowrap;
		}

		.company-link {
			color: var(--color-text-muted);
		}

		.login {
			font-weight: var(--font-weight-bold);
			color: var(--color-text);
		}

		.divider {
			inline-size: var(--border-thin);
			block-size: 1.125rem;
			margin-inline: 0.375rem;
			background-color: var(--color-line);
		}

		/* ---------- Main bar ---------- */

		.bar {
			display: flex;
			gap: 0.75rem;
			align-items: center;
			justify-content: space-between;
			min-block-size: var(--bar-height);
		}

		.main-nav,
		.bar > .cta {
			display: none;
		}

		.menu {
			display: flex;
			align-items: center;
		}

		.menu-item {
			position: relative;
		}

		.menu-button,
		.menu-link {
			display: inline-flex;
			gap: 0.375rem;
			align-items: center;
			min-block-size: var(--target-min);
			padding-inline: var(--nav-item-padding);
			font-size: var(--nav-font-size);
			font-weight: var(--font-weight-semibold);
			color: inherit;
			text-decoration: none;
			white-space: nowrap;
			background: none;
			border: 0;
		}

		.menu-button {
			cursor: pointer;

			&[aria-expanded='true'] .caret {
				rotate: 180deg;
			}
		}

		.dropdown {
			position: absolute;
			inset-block-start: calc(100% + 0.5rem);
			inset-inline-start: 0;
			z-index: var(--layer-dropdown);
			min-inline-size: 15rem;
			padding: 0.5rem;
			background-color: var(--color-surface);
			border: var(--border-thin) solid var(--color-line);
			border-block-start: var(--accent-bar) solid var(--color-gold);
			border-radius: var(--radius-l);
			box-shadow: var(--shadow-panel);

			&[hidden] {
				display: none;
			}
		}

		/* The last menu opens toward the left so it never runs off the screen. */
		.menu-item:last-child .dropdown {
			inset-inline: auto 0;
		}

		.dropdown-list {
			display: grid;
		}

		.dropdown-link {
			display: flex;
			align-items: center;
			min-block-size: var(--target-min);
			padding-inline: 0.875rem;
			font-size: 0.9375rem;
			font-weight: var(--font-weight-semibold);
			color: var(--color-text);
			text-decoration: none;
			white-space: nowrap;
			border-radius: var(--radius-s);
		}

		.open-sheet,
		.close-sheet {
			display: inline-flex;
			gap: 0.5rem;
			align-items: center;
			min-block-size: var(--target-min);
			padding-inline: 0.75rem;
			font-weight: var(--font-weight-bold);
			color: var(--color-text);
			cursor: pointer;
			background: none;
			border: var(--border-thin) solid var(--color-line);
			border-radius: var(--radius-m);
		}

		/* ---------- Phone and tablet menu ---------- */

		.sheet {
			inline-size: 100%;
			max-inline-size: none;
			block-size: 100dvh;
			max-block-size: none;
			padding: 0;
			margin: 0;
			color: var(--color-text);
			background: transparent;
			border: 0;

			&::backdrop {
				background-color: var(--color-backdrop);
			}
		}

		.panel {
			display: flex;
			flex-direction: column;
			inline-size: 100%;
			block-size: 100%;
			margin-inline-start: auto;
			background-color: var(--color-surface);
		}

		.panel-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			min-block-size: var(--bar-height);
			padding-inline: var(--space-gutter);
			border-block-end: var(--border-thin) solid var(--color-line);
		}

		.sheet-nav {
			display: flex;
			flex: 1;
			flex-direction: column;
			padding-inline: var(--space-gutter);
			overflow-y: auto;
		}

		.sheet-section {
			border-block-end: var(--border-thin) solid var(--color-line);

			&[open] .caret {
				rotate: 180deg;
			}
		}

		.sheet-summary,
		.sheet-top-link {
			display: flex;
			align-items: center;
			justify-content: space-between;
			min-block-size: 3.25rem;
			font-size: 1.125rem;
			font-weight: var(--font-weight-bold);
			color: var(--color-text);
			text-decoration: none;
			cursor: pointer;
		}

		.sheet-summary {
			list-style: none;

			&::-webkit-details-marker {
				display: none;
			}
		}

		.sheet-top-link {
			border-block-end: var(--border-thin) solid var(--color-line);
		}

		.sheet-list {
			display: grid;
			padding-block-end: 0.5rem;
		}

		.sheet-link {
			display: flex;
			align-items: center;
			min-block-size: var(--target-min);
			padding-inline-start: 1rem;
			font-weight: var(--font-weight-semibold);
			color: var(--color-text);
			text-decoration: none;
		}

		.panel-actions {
			display: grid;
			gap: 0.75rem;
			padding: 1rem var(--space-gutter);
			border-block-start: var(--accent-bar) solid var(--color-gold);
		}

		.login-button {
			display: flex;
			align-items: center;
			justify-content: center;
			min-block-size: 3.25rem;
			font-weight: var(--font-weight-bold);
			color: var(--color-text);
			text-decoration: none;
			border: var(--border-thin) solid var(--color-gold);
			border-radius: var(--radius-m);
		}

		.panel-actions .cta {
			min-block-size: 3.25rem;
		}

		/* ---------- States (after the base rules they change) ---------- */

		.menu-button[aria-expanded='true'],
		.menu-button[data-current],
		.menu-link[aria-current='page'],
		.company-link[aria-current='page'],
		.sheet-section[open] > .sheet-summary,
		.sheet-link[aria-current='page'],
		.sheet-top-link[aria-current='page'],
		.dropdown-link[aria-current='page'] {
			color: var(--color-gold-hover);
		}

		@media (hover: hover) {
			.menu-button:hover,
			.menu-link:hover,
			.company-link:hover,
			.login:hover,
			.sheet-link:hover {
				color: var(--color-gold-hover);
			}

			.dropdown-link:hover {
				color: var(--color-gold-hover);
				background-color: var(--color-surface-hover);
			}

			.cta:hover {
				background-color: var(--color-gold-hover);
			}
		}

		/* ---------- Breakpoints ---------- */

		/* From 480px the menu becomes a side panel over the dimmed page. */
		@media (--sm) {
			.site-header {
				--bar-height: 4.25rem;
				--logo-height: 2rem;
			}

			.panel {
				inline-size: min(100%, 26rem);
				border-inline-start: var(--border-thin) solid var(--color-line);
			}

			.panel-header .brand {
				--logo-height: 1.75rem;
			}
		}

		/* From 1024px: the top bar and the full menu; the Menu button and panel go away. */
		@media (--nav-full) {
			.site-header {
				--bar-height: 4.5rem;
				--logo-height: 1.875rem;
			}

			.topbar,
			.main-nav,
			.bar > .cta {
				display: flex;
			}

			.open-sheet,
			.sheet {
				display: none;
			}
		}

		/* From 1280px there is room for larger labels and logo. */
		@media (--xl) {
			.site-header {
				--bar-height: 4.75rem;
				--logo-height: 2.25rem;
				--nav-font-size: 1rem;
				--nav-item-padding: 0.75rem;
			}

			.bar > .cta {
				padding-inline: 1.5rem;
			}
		}
	}
</style>
