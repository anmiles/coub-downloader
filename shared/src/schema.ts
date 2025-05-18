import { z } from 'zod';

export const coubFileSchema = z.object({
	url : z.string(),
	size: z.number(),
});

export const coubSchema = z.object({
	permalink    : z.string(),
	title        : z.string(),
	file_versions: z.object({
		html5: z.object({
			video: z.record(z.string(), coubFileSchema).optional(),
			audio: z.record(z.string(), coubFileSchema).optional(),
		}),
	}),
	media_blocks: z.object({
		external_raw_videos: z.array(
			z.object({
				title: z.string(),
				url  : z.string(),
				meta : z.object({
					service: z.string(),
				}),
			}),
		),
	}),
	picture    : z.string(),
	likes_count: z.number(),
	views_count: z.number(),
}).catchall(z.unknown());

export const coubsJsonSchema = z.object({
	coubs      : z.unknown().array(),
	page       : z.number(),
	total_pages: z.number(),
});

export const coubsTypeSchema = z.union([
	z.literal('favourites'),
	z.literal('likes'),
]);

export type Coub = z.infer<typeof coubSchema>;
export type CoubFile = z.infer<typeof coubFileSchema>;
export type CoubsJson = z.infer<typeof coubsJsonSchema>;
export type CoubsType = z.infer<typeof coubsTypeSchema>;
