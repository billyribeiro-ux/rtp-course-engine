/** @type {import('stylelint').Config} */
const config = {
	extends: ['stylelint-config-standard', 'stylelint-config-html/svelte'],
	plugins: ['stylelint-declaration-strict-value'],
	rules: {
		// Cascade layers decide what wins, so `!important` is never needed.
		'declaration-no-important': true,
		'selector-max-id': 0,
		'max-nesting-depth': 2,
		// Width and height queries live only in src/lib/styles/media.css (see overrides).
		'media-feature-name-disallowed-list': ['/width$/', '/height$/'],
		// Colors, fills, shadows and stacking come only from tokens.
		'scale-unlimited/declaration-strict-value': [
			['/color$/', 'fill', 'stroke', 'background', 'box-shadow', 'z-index'],
			{ ignoreValues: ['currentcolor', 'transparent', 'inherit', 'none', 'initial', 'unset'] }
		],
		// Custom properties and custom media are kebab-case; numeric steps like --space-2xs are allowed.
		'custom-property-pattern': '^[a-z0-9]+(-[a-z0-9]+)*$',
		'custom-media-pattern': '^[a-z0-9]+(-[a-z0-9]+)*$',
		// Svelte's :global() escapes component scoping; it is banned.
		'selector-pseudo-class-disallowed-list': ['global']
	},
	overrides: [
		{ files: ['src/lib/styles/media.css'], rules: { 'media-feature-name-disallowed-list': null } },
		{
			files: ['src/lib/styles/tokens.css'],
			rules: { 'scale-unlimited/declaration-strict-value': null }
		}
	]
};

export default config;
