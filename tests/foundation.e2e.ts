import { expect, test } from '@playwright/test';

test('the cascade layers exist in the agreed order', async ({ page }) => {
	await page.goto('/');
	// A layer's priority is set by where its name first appears. The production build
	// inlines the imports, so read the order of first appearance, not one statement.
	const order = await page.evaluate(() => {
		const names: string[] = [];
		for (const sheet of document.styleSheets) {
			for (const rule of sheet.cssRules) {
				const found =
					rule instanceof CSSLayerStatementRule
						? rule.nameList
						: rule instanceof CSSLayerBlockRule
							? [rule.name]
							: [];
				for (const name of found) if (!names.includes(name)) names.push(name);
			}
		}
		return names;
	});
	expect(order).toEqual(['reset', 'tokens', 'base', 'layout', 'components', 'utilities']);
});

for (const colorScheme of ['light', 'dark'] as const) {
	test(`${colorScheme} system setting: the page stays on the approved navy and text tokens`, async ({
		page
	}) => {
		await page.emulateMedia({ colorScheme });
		await page.goto('/');
		const body = page.locator('body');
		await expect(body).toHaveCSS('background-color', 'oklch(0.1898 0.0458 261.92)');
		await expect(body).toHaveCSS('color', 'oklch(0.9594 0.0108 256.7)');
	});
}

test('headings use Poppins and paragraphs use Montserrat, both from our own server', async ({
	page,
	baseURL
}) => {
	const fontRequests: string[] = [];
	page.on('requestfinished', (request) => {
		if (request.resourceType() === 'font') fontRequests.push(request.url());
	});
	await page.goto('/');
	await expect(page.locator('body')).toHaveCSS('font-family', /^"Montserrat Variable"/);
	await expect(page.locator('h1')).toHaveCSS('font-family', /^Poppins/);
	const loadedFamilies = await page.evaluate(async () => {
		await document.fonts.ready;
		return [...document.fonts]
			.filter((face) => face.status === 'loaded')
			.map((face) => face.family.replaceAll('"', ''));
	});
	expect(loadedFamilies).toContain('Poppins');
	expect(loadedFamilies).toContain('Montserrat Variable');
	expect(fontRequests.length).toBeGreaterThan(0);
	for (const url of fontRequests) expect(new URL(url).origin).toBe(new URL(baseURL ?? '').origin);
});

test('the two fonts every page needs are preloaded, and each is fetched once', async ({ page }) => {
	await page.goto('/');
	const preloaded = await page
		.locator('link[rel="preload"][as="font"]')
		.evaluateAll((links) => links.map((link) => (link as HTMLLinkElement).href).sort());
	expect(preloaded).toHaveLength(2);
	expect(preloaded[0]).toMatch(/\/montserrat-latin-wght-normal\.[^/]+\.woff2$/);
	expect(preloaded[1]).toMatch(/\/poppins-latin-700-normal\.[^/]+\.woff2$/);
	// A preload the stylesheet cannot reuse (a CORS mismatch, say) shows up as a second fetch.
	const fetched = await page.evaluate(async () => {
		await document.fonts.ready;
		return performance
			.getEntriesByType('resource')
			.map((entry) => entry.name)
			.filter((name) => name.endsWith('.woff2'))
			.sort();
	});
	expect(fetched).toEqual(preloaded);
});
