/** @type {import('@trivago/prettier-plugin-sort-imports').PrettierConfig} */
const prettierConfig = {
	endOfLine: 'lf',
	printWidth: 150,
	quoteProps: 'as-needed',
	semi: true,
	singleQuote: true,
	tabWidth: 2,
	trailingComma: 'none',
	useTabs: true,
	plugins: ['@trivago/prettier-plugin-sort-imports'],
	importOrder: [
		'^#lib/setup',
		'^#commands/?(.*)$',
		'^#lib/?(.*)$',
		'^@[^/]+/?(.*)$', // matches any package that starts with @<any package author>/<any package name>
		'node:',
		'^[a-z0-9]'
	],
	importOrderSeparation: false,
	importOrderSortSpecifiers: true,
	importOrderParserPlugins: ['typescript', 'decorators']
};

export default prettierConfig;
