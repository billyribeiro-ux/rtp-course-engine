// Fails when a Svelte component's <style> is not wrapped in `@layer components`.
// An unlayered rule beats every layer, which would silently break the cascade order.
import { globSync, readFileSync } from 'node:fs';

const offenders = [];
for (const file of globSync('src/**/*.svelte')) {
	const source = readFileSync(file, 'utf8');
	for (const match of source.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) {
		const css = (match[1] ?? '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
		if (css !== '' && !/^@layer components\s*\{[\s\S]*\}$/.test(css)) offenders.push(file);
	}
}

if (offenders.length > 0) {
	console.error('Unlayered <style> blocks (wrap them in `@layer components { ... }`):');
	for (const file of offenders) console.error(`  ${file}`);
	process.exit(1);
}
console.log('All component styles are in @layer components.');
