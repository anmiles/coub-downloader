module.exports = {
	root : true,

	extends : [
		'./node_modules/@anmiles/eslint-config/src/base.preset.js',
		'./node_modules/@anmiles/eslint-config/src/ts.preset.js',
		'./node_modules/@anmiles/eslint-config/src/jest.preset.js',
	],

	rules : {
		'camelcase' : [ 'error', { allow : [
			'total_pages',
			'likes_count',
			'views_count',
			'file_versions',
			'media_blocks',
			'external_raw_videos',
		] } ],
	},
};
