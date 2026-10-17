/**
 * The site navigation: the single source for the header's links.
 *
 * Labels, order and destinations match the live Revolution Trading Pros site
 * (frontend/src/lib/components/nav/NavBar.svelte in the Revolution-trading-pros
 * repo). Every destination is a `RouteId`, so a link to a route that does not
 * exist fails the type check instead of shipping as a broken link.
 */
import type { RouteId } from '$app/types';

/** One link to a page in this app. */
export interface NavLink {
	readonly kind: 'link';
	readonly label: string;
	readonly route: RouteId;
}

/** A top-level item that opens a list of links. */
export interface NavMenu {
	readonly kind: 'menu';
	/** Stable, unique, URL-safe; used to build element ids. */
	readonly id: string;
	readonly label: string;
	readonly links: readonly NavLink[];
}

export type NavItem = NavLink | NavMenu;

/** Where an item sits on wide screens: the main row or the thin top bar. */
export type NavPlacement = 'main' | 'company';

export interface SiteNavEntry {
	readonly placement: NavPlacement;
	readonly item: NavItem;
}

const link = (label: string, route: RouteId): NavLink => ({ kind: 'link', label, route });

/** Every item, in the live site's order. The phone and tablet menu shows them in this order. */
export const SITE_NAV: readonly SiteNavEntry[] = [
	{
		placement: 'main',
		item: {
			kind: 'menu',
			id: 'live-trading-rooms',
			label: 'Live Trading Rooms',
			links: [
				link('Day Trading Room', '/live-trading-rooms/day-trading'),
				link('Swing Trading Room', '/live-trading-rooms/swing-trading'),
				link('Small Accounts Room', '/live-trading-rooms/small-accounts')
			]
		}
	},
	{
		placement: 'main',
		item: {
			kind: 'menu',
			id: 'alert-services',
			label: 'Alert Services',
			links: [
				link('SPX Profit Pulse', '/alerts/spx-profit-pulse'),
				link('Explosive Swings', '/alerts/explosive-swings')
			]
		}
	},
	{ placement: 'main', item: link('Mentorship', '/mentorship') },
	{
		placement: 'main',
		item: {
			kind: 'menu',
			id: 'store',
			label: 'Store',
			links: [
				link('Courses', '/courses'),
				link('Indicators', '/indicators'),
				link('Scanners', '/store/scanners')
			]
		}
	},
	{ placement: 'company', item: link('Our Mission', '/our-mission') },
	{ placement: 'company', item: link('About', '/about') },
	{ placement: 'company', item: link('Blogs', '/blog') },
	{
		placement: 'main',
		item: {
			kind: 'menu',
			id: 'resources',
			label: 'Resources',
			links: [
				link('Options Calculator', '/tools/options-calculator'),
				link('ETF Stocks List', '/resources/etf-stocks-list'),
				link('Stock Indexes List', '/resources/stock-indexes-list')
			]
		}
	}
];

/** The main row on wide screens. */
export const MAIN_NAV: readonly NavItem[] = SITE_NAV.filter(
	(entry) => entry.placement === 'main'
).map((entry) => entry.item);

/** The top bar's company links on wide screens. */
export const COMPANY_NAV: readonly NavItem[] = SITE_NAV.filter(
	(entry) => entry.placement === 'company'
).map((entry) => entry.item);

export const LOGIN_LINK: NavLink = link('Login', '/login');
export const CALL_TO_ACTION: NavLink = link('Get Started', '/get-started');
