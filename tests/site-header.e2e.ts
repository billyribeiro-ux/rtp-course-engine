import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/** Verification widths from the Standards: WCAG reflow, phones, tablets, laptops, desktops. */
const WIDTHS = [
	320, 360, 390, 402, 412, 414, 440, 744, 820, 834, 1024, 1032, 1280, 1366, 1440, 1536, 1920
];
const NAV_FULL = 1024; // --nav-full: 64rem at the default 16px font size

async function setWidth(page: Page, width: number): Promise<void> {
	await page.setViewportSize({ width, height: 900 });
}

/** Load the home page and wait until its JavaScript has run, so the menus respond. */
async function open(page: Page): Promise<void> {
	await page.goto('/', { waitUntil: 'networkidle' });
}

const mainNav = (page: Page) => page.locator('.main-nav');
const menuButton = (page: Page) => page.getByRole('button', { name: 'Menu' });
const sheet = (page: Page) => page.getByRole('dialog', { name: 'Menu' });

test.describe('every width', () => {
	for (const width of WIDTHS) {
		test(`${width}px: no sideways scroll, and the right controls show`, async ({ page }) => {
			await setWidth(page, width);
			await open(page);
			const overflow = await page.evaluate(
				() => document.documentElement.scrollWidth - document.documentElement.clientWidth
			);
			expect(overflow).toBe(0);
			await expect(page.getByRole('link', { name: 'Revolution Trading Pros' })).toBeVisible();
			if (width >= NAV_FULL) {
				await expect(mainNav(page)).toBeVisible();
				await expect(page.getByRole('navigation', { name: 'Company' })).toBeVisible();
				await expect(page.locator('.bar > .cta')).toBeVisible();
				await expect(menuButton(page)).toBeHidden();
			} else {
				await expect(mainNav(page)).toBeHidden();
				await expect(page.getByRole('navigation', { name: 'Company' })).toBeHidden();
				await expect(menuButton(page)).toBeVisible();
			}
		});
	}
});

for (const width of [1024, 1280]) {
	test(`at ${width}px the main row and the top bar each fit on one line`, async ({ page }) => {
		await setWidth(page, width);
		await open(page);
		const middles = async (selector: string): Promise<number[]> =>
			page.locator(selector).evaluateAll((elements) =>
				elements.map((element) => {
					const box = element.getBoundingClientRect();
					return Math.round(box.top + box.height / 2);
				})
			);
		const mainRow = await middles('.menu-button, .menu-link, .bar > .cta');
		expect(mainRow.length).toBe(6);
		expect(new Set(mainRow).size).toBe(1);
		const topRow = await middles('.company-link, .login');
		expect(topRow.length).toBe(4);
		expect(new Set(topRow).size).toBe(1);
		const fits = await page
			.locator('.bar')
			.evaluate((element) => element.scrollWidth <= element.clientWidth);
		expect(fits).toBe(true);
	});
}

test.describe('wide-screen menus', () => {
	test.beforeEach(async ({ page }) => {
		await setWidth(page, 1280);
		await open(page);
	});

	test('a click opens a menu; Escape closes it and returns focus', async ({ page }) => {
		const store = page.getByRole('button', { name: 'Store' });
		await store.click();
		await expect(store).toHaveAttribute('aria-expanded', 'true');
		await expect(page.getByRole('link', { name: 'Indicators' })).toBeVisible();
		await page.keyboard.press('Escape');
		await expect(store).toHaveAttribute('aria-expanded', 'false');
		await expect(page.getByRole('link', { name: 'Indicators' })).toBeHidden();
		await expect(store).toBeFocused();
	});

	test('only one menu is open at a time, and a click outside closes it', async ({ page }) => {
		await page.getByRole('button', { name: 'Live Trading Rooms' }).click();
		await page.getByRole('button', { name: 'Alert Services' }).click();
		await expect(page.getByRole('link', { name: 'Day Trading Room' })).toBeHidden();
		await expect(page.getByRole('link', { name: 'SPX Profit Pulse' })).toBeVisible();
		await page.mouse.click(700, 600);
		await expect(page.getByRole('link', { name: 'SPX Profit Pulse' })).toBeHidden();
	});

	test('works by keyboard, and tabbing out closes the menu', async ({ page }) => {
		const resources = page.getByRole('button', { name: 'Resources' });
		await resources.focus();
		await page.keyboard.press('Enter');
		await expect(resources).toHaveAttribute('aria-expanded', 'true');
		await page.keyboard.press('Tab');
		await expect(page.getByRole('link', { name: 'Options Calculator' })).toBeFocused();
		await page.keyboard.press('Tab');
		await page.keyboard.press('Tab');
		await page.keyboard.press('Tab');
		await expect(resources).toHaveAttribute('aria-expanded', 'false');
	});

	test('a menu link navigates, closes the menu and marks the page as current', async ({ page }) => {
		await page.getByRole('button', { name: 'Live Trading Rooms' }).click();
		await page.getByRole('link', { name: 'Swing Trading Room' }).click();
		await expect(page).toHaveURL('/live-trading-rooms/swing-trading');
		await expect(page.getByRole('heading', { level: 1, name: 'Swing Trading Room' })).toBeVisible();
		const rooms = page.getByRole('button', { name: 'Live Trading Rooms' });
		await expect(rooms).toHaveAttribute('aria-expanded', 'false');
		await expect(rooms).toHaveAttribute('data-current', '');
		await rooms.click();
		await expect(page.getByRole('link', { name: 'Swing Trading Room' })).toHaveAttribute(
			'aria-current',
			'page'
		);
	});

	test('top bar links navigate', async ({ page }) => {
		await page
			.getByRole('navigation', { name: 'Company' })
			.getByRole('link', { name: 'About' })
			.click();
		await expect(page).toHaveURL('/about');
		await page.getByRole('link', { name: 'Login' }).click();
		await expect(page).toHaveURL('/login');
	});

	test('the last menu opens inside the screen at 1024px', async ({ page }) => {
		await setWidth(page, 1024);
		await page.getByRole('button', { name: 'Resources' }).click();
		const right = await page
			.locator('.dropdown:not([hidden])')
			.evaluate((element) => element.getBoundingClientRect().right);
		expect(right).toBeLessThanOrEqual(1024);
	});
});

test.describe('phone and tablet menu', () => {
	test.beforeEach(async ({ page }) => {
		await setWidth(page, 390);
		await open(page);
	});

	test('opens as a modal; Escape closes it and returns focus', async ({ page }) => {
		await menuButton(page).click();
		await expect(sheet(page)).toBeVisible();
		await expect(menuButton(page)).toHaveAttribute('aria-expanded', 'true');
		await page.keyboard.press('Escape');
		await expect(sheet(page)).toBeHidden();
		await expect(menuButton(page)).toBeFocused();
		await expect(menuButton(page)).toHaveAttribute('aria-expanded', 'false');
	});

	test('lists every item in the live site order', async ({ page }) => {
		await menuButton(page).click();
		const labels = await sheet(page)
			.locator('.sheet-summary, .sheet-top-link')
			.evaluateAll((elements) => elements.map((element) => (element.textContent ?? '').trim()));
		expect(labels).toEqual([
			'Live Trading Rooms',
			'Alert Services',
			'Mentorship',
			'Store',
			'Our Mission',
			'About',
			'Blogs',
			'Resources'
		]);
		await expect(sheet(page).getByRole('link', { name: 'Login' })).toBeVisible();
		await expect(sheet(page).getByRole('link', { name: 'Get Started' })).toBeVisible();
	});

	test('the Close button and, on tablets, the backdrop close it', async ({ page }) => {
		await menuButton(page).click();
		await page.getByRole('button', { name: 'Close' }).click();
		await expect(sheet(page)).toBeHidden();
		await setWidth(page, 820);
		await menuButton(page).click();
		await page.mouse.click(20, 450);
		await expect(sheet(page)).toBeHidden();
	});

	test('sections open one at a time, and a link navigates and closes the menu', async ({
		page
	}) => {
		await menuButton(page).click();
		await sheet(page).getByText('Store', { exact: true }).click();
		await expect(sheet(page).getByRole('link', { name: 'Courses' })).toBeVisible();
		await sheet(page).getByText('Resources', { exact: true }).click();
		await expect(sheet(page).getByRole('link', { name: 'Courses' })).toBeHidden();
		await sheet(page).getByRole('link', { name: 'ETF Stocks List' }).click();
		await expect(page).toHaveURL('/resources/etf-stocks-list');
		await expect(sheet(page)).toBeHidden();
	});

	test('the page behind cannot scroll while the menu is open', async ({ page }) => {
		await menuButton(page).click();
		const overflow = await page.evaluate(() => getComputedStyle(document.documentElement).overflow);
		expect(overflow).toBe('hidden');
	});
});

test.describe('accessibility', () => {
	test('phone: no axe violations with the menu closed and open', async ({ page }) => {
		await setWidth(page, 390);
		await open(page);
		expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
		await menuButton(page).click();
		await sheet(page).getByText('Live Trading Rooms', { exact: true }).click();
		expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
	});

	test('wide screen: no axe violations with a menu closed and open', async ({ page }) => {
		await setWidth(page, 1280);
		await open(page);
		expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
		await page.getByRole('button', { name: 'Store' }).click();
		expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
	});

	test('every header control is at least 44px tall', async ({ page }) => {
		for (const width of [390, 1024, 1280]) {
			await setWidth(page, width);
			await open(page);
			const heights = await page
				.locator('.site-header a:visible, .site-header button:visible')
				.evaluateAll((elements) =>
					elements.map((element) => element.getBoundingClientRect().height)
				);
			expect(heights.length).toBeGreaterThan(0);
			for (const height of heights) expect(height).toBeGreaterThanOrEqual(44);
		}
	});

	test('the skip link appears on Tab and moves focus past the header', async ({ page }) => {
		await setWidth(page, 1280);
		await open(page);
		await page.keyboard.press('Tab');
		const skip = page.getByRole('link', { name: 'Skip to main content' });
		await expect(skip).toBeFocused();
		await expect(skip).toBeInViewport();
		await page.keyboard.press('Enter');
		await expect(page.locator('#main')).toBeFocused();
	});

	test('reduced motion turns transitions off', async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'reduce' });
		await setWidth(page, 1280);
		await open(page);
		const duration = await page
			.locator('.menu-button .caret')
			.first()
			.evaluate((element) => getComputedStyle(element).transitionDuration);
		expect(duration).toBe('0s');
	});
});
