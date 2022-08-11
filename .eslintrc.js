module.exports = {
	root    : true,
	extends : [
		'eslint:recommended',
		'plugin:jest/recommended',
	],
	parser        : '@typescript-eslint/parser',
	parserOptions : {
		ecmaVersion : 2019,
		sourceType  : 'module',
	},
	plugins : [
		'@typescript-eslint',
		'align-assignments',
		'import',
		'jest',
	],
	env : {
		node : true,
		jest : true,
	},
	ignorePatterns : [
		'**/node_modules/',
		'coverage/',
		'dist/',
		'input/',
		'output/',
	],
	rules : {
		'no-unused-vars'                      : [ 'off' ],
		'@typescript-eslint/no-unused-vars'   : [ 'error' ],
		'align-assignments/align-assignments' : [ 'error' ],
		'array-bracket-spacing'               : [ 'error', 'always' ],
		'arrow-body-style'                    : [ 'error' ],
		'arrow-parens'                        : [ 'error' ],
		'arrow-spacing'                       : [ 'error' ],
		'block-spacing'                       : [ 'error' ],
		'brace-style'                         : [ 'error' ],
		'camelcase'                           : [ 'error' ],
		'comma-dangle'                        : [ 'error', 'always-multiline' ],
		'comma-spacing'                       : [ 'error' ],
		'comma-style'                         : [ 'error' ],
		'complexity'                          : [ 'error' ],
		'computed-property-spacing'           : [ 'error', 'never' ],
		'curly'                               : [ 'error' ],
		'dot-location'                        : [ 'error', 'property' ],
		'eol-last'                            : [ 'error' ],
		'func-call-spacing'                   : [ 'error' ],
		'func-style'                          : [ 'error', 'declaration', { allowArrowFunctions : true } ],
		'generator-star-spacing'              : [ 'error', 'neither' ],
		'import/order'                        : [ 'error', { groups : [ 'builtin', 'external', 'unknown', 'internal', 'parent', 'sibling', 'index' ] } ],
		'indent'                              : [ 'error', 'tab', { SwitchCase : 1 } ],
		'jest/no-standalone-expect'           : [ 'error' ],
		'key-spacing'                         : [ 'error', { beforeColon : true, afterColon : true, align : 'colon' } ],
		'keyword-spacing'                     : [ 'error' ],
		'linebreak-style'                     : [ 'error', 'unix' ],
		'max-params'                          : [ 'error', { max : 5 } ],
		'new-parens'                          : [ 'error' ],
		'no-eval'                             : [ 'error' ],
		'no-extra-bind'                       : [ 'error' ],
		'no-floating-decimal'                 : [ 'error' ],
		'no-implied-eval'                     : [ 'error' ],
		'no-loop-func'                        : [ 'error' ],
		'no-mixed-spaces-and-tabs'            : [ 'error', 'smart-tabs' ],
		'no-multiple-empty-lines'             : [ 'error', { max : 1, maxEOF : 1, maxBOF : 0 } ],
		'no-return-await'                     : [ 'error' ],
		'no-trailing-spaces'                  : [ 'error' ],
		'no-useless-rename'                   : [ 'error' ],
		'no-var'                              : [ 'error' ],
		'no-whitespace-before-property'       : [ 'error' ],
		'object-curly-spacing'                : [ 'error', 'always' ],
		'object-property-newline'             : [ 'error', { allowMultiplePropertiesPerLine : true } ],
		'object-shorthand'                    : [ 'error' ],
		'operator-linebreak'                  : [ 'error', 'before' ],
		'prefer-const'                        : [ 'error' ],
		'prefer-numeric-literals'             : [ 'error' ],
		'prefer-spread'                       : [ 'error' ],
		'prefer-template'                     : [ 'error' ],
		'quote-props'                         : [ 'error', 'consistent-as-needed' ],
		'quotes'                              : [ 'error', 'single', { avoidEscape : true } ],
		'semi-spacing'                        : [ 'error' ],
		'semi'                                : [ 'error' ],
		'space-before-blocks'                 : [ 'error' ],
		'space-before-function-paren'         : [ 'error', { anonymous : 'never', named : 'never', asyncArrow : 'always' } ],
		'space-in-parens'                     : [ 'error' ],
		'space-infix-ops'                     : [ 'error' ],
		'space-unary-ops'                     : [ 'error' ],
		'spaced-comment'                      : [ 'error' ],
		'template-curly-spacing'              : [ 'error' ],
		'yield-star-spacing'                  : [ 'error' ],
		'yoda'                                : [ 'error' ],
	},
};
