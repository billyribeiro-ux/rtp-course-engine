import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
	CALL_TO_ACTION,
	COMPANY_NAV,
	LOGIN_LINK,
	MAIN_NAV,
	SITE_NAV,
	type NavItem,
	type NavLink
} from './navigation.js';

function linksOf(item: NavItem): readonly NavLink[] {
	return item.kind === 'menu' ? item.links : [item];
}

const allLinks: readonly NavLink[] = [
	...SITE_NAV.flatMap((entry) => linksOf(entry.item)),
	LOGIN_LINK,
	CALL_TO_ACTION
];

describe('site navigation', () => {
	it('keeps the live site order', () => {
		expect(SITE_NAV.map((entry) => entry.item.label)).toEqual([
			'Live Trading Rooms',
			'Alert Services',
			'Mentorship',
			'Store',
			'Our Mission',
			'About',
			'Blogs',
			'Resources'
		]);
	});

	it('splits into the main row and the company links', () => {
		expect(MAIN_NAV.map((item) => item.label)).toEqual([
			'Live Trading Rooms',
			'Alert Services',
			'Mentorship',
			'Store',
			'Resources'
		]);
		expect(COMPANY_NAV.map((item) => item.label)).toEqual(['Our Mission', 'About', 'Blogs']);
	});

	it('gives every menu a unique id and at least one link', () => {
		const menus = SITE_NAV.map((entry) => entry.item).filter((item) => item.kind === 'menu');
		expect(new Set(menus.map((menu) => menu.id)).size).toBe(menus.length);
		for (const menu of menus) expect(menu.links.length).toBeGreaterThan(0);
	});

	it('links each destination once, with a label', () => {
		expect(new Set(allLinks.map((entry) => entry.route)).size).toBe(allLinks.length);
		for (const entry of allLinks) expect(entry.label.trim()).not.toBe('');
	});

	it('has a page for every destination', () => {
		for (const entry of allLinks) {
			expect(existsSync(`src/routes${entry.route}/+page.svelte`), entry.route).toBe(true);
		}
	});
});
