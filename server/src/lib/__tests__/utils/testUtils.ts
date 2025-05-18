import type { Coub } from '@coub-downloader/shared';

export function createTestCoub(id: string, override?: Partial<Coub>): Coub {
	return {
		title        : `Title: ${id}`,
		permalink    : id,
		picture      : `${id}.jpg`,
		likes_count  : 1,
		views_count  : 2,
		file_versions: {
			html5: {
				video: {},
				audio: {},
			},
		},
		media_blocks: {
			external_raw_videos: [],
		},
		...override,
	};
}
