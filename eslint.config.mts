import { configs, globals } from '@anmiles/eslint-config';
import type { Linter } from 'eslint';

export default [
	...configs.base,
	...configs.ts,
	...configs.jest,

	{
		ignores: [
			'**/coverage/*',
			'**/dist/*',
			'input/*',
			'output/*',
		],
	},

	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.jquery,
			},
		},
	},

	{
		rules: {
			'camelcase': [ 'error', { allow: [
				'total_pages',
				'likes_count',
				'views_count',
				'file_versions',
				'media_blocks',
				'external_raw_videos',
			] } ],
		},
	},
] as Linter.Config[];
