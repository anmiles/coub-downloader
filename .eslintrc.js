module.exports = {
	extends: [
		'eslint:recommended',
		'plugin:jest/recommended',
		'plugin:@typescript-eslint/recommended'
	],
	ignorePatterns : [
		'**/.coverage/',
		'**/dist/',
		'**/input/',
		'**/node_modules/',
		'**/output/',
	],
	plugins        : [ 'jest' ],
	parserOptions: {
		ecmaVersion: 2018,
		sourceType: 'module'
	},
	env: {
		es6 : true,
		node: true,
		jest: true
	},
	rules: {
		indent: [ 'error', 'tab' ],
		'linebreak-style': [ 'error', 'unix' ],
		'quotes': [ 'error', 'single' ],
		'semi': [ 'error', 'always' ]
	}
};
