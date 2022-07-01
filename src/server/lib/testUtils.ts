import type { Coub } from '../types';

export { createTestCoub };
export default { createTestCoub };

function createTestCoub(id: string, override?: Partial<Coub>): Coub {
	/* eslint-disable camelcase */
	return {
		title         : `Title: ${id}`,
		permalink     : id,
		picture       : `${id}.jpg`,
		likes_count   : 1,
		views_count   : 1,
		file_versions : {
			html5 : {
				video : {},
				audio : {},
			},
		},
		media_blocks : {
			external_raw_videos : [],
		},
		...override,
	};
	/* eslint-enable camelcase */
}
