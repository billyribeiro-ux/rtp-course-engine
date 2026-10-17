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

test('light scheme: the page uses the paper and ink tokens', async ({ page }) => {
	await page.emulateMedia({ colorScheme: 'light' });
	await page.goto('/');
	const body = page.locator('body');
	await expect(body).toHaveCSS('background-color', 'oklch(0.995 0.004 95)');
	await expect(body).toHaveCSS('color', 'oklch(0.155 0.012 265)');
});

test('dark scheme: the page switches to the dark tokens', async ({ page }) => {
	await page.emulateMedia({ colorScheme: 'dark' });
	await page.goto('/');
	const body = page.locator('body');
	await expect(body).toHaveCSS('background-color', 'oklch(0.155 0.012 265)');
	await expect(body).toHaveCSS('color', 'oklch(0.93 0.006 265)');
});
