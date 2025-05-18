export interface CoubFile {
	url: string;
	size: number;
}

export interface Coub extends Record<string, unknown> {
	permalink: string;
	title: string;
	file_versions: {
		html5: {
			video?: Record<string, CoubFile>;
			audio?: Record<string, CoubFile>;
		};
	};
	media_blocks: {
		external_raw_videos: Array<{
			title: string;
			url: string;
			meta: {
				service: string;
			};
		}>;
	};
	picture: string;
	likes_count: number;
	views_count: number;
}
