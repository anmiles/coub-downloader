export { createTestCoub };
import type { Coub } from '../types/coub';

function createTestCoub(id: string, override?: Partial<Coub>): Coub {
	return {
		permalink: id,
		title: `Title: ${id}`,
		file_versions: {
			html5: {
				video: {},
				audio: {}
			}
		},
		media_blocks: {
			external_raw_videos: [],
		},
		picture: `${id}.jpg`,
		likes_count: 1,
		views_count: 1,
		...override
	};
}
