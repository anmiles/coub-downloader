import fs from 'fs';

import type { Coub } from '@coub-downloader/shared';
import _ from 'lodash';

import { getTemplateFile } from './utils/paths';

export const templates = {
	index     : [ 'style', 'page', 'script' ] as const,
	page      : [ 'content' ] as const,
	style     : [ ] as const,
	script    : [ ] as const,
	coub      : [ 'video', 'audio', 'fullscreen', 'stats', 'title', 'externals' ] as const,
	video     : [ 'permalink' ] as const,
	audio     : [ 'permalink' ] as const,
	fullscreen: [ ] as const,
	stats     : [ 'likes', 'views' ] as const,
	external  : [ 'service', 'url', 'title' ] as const,
} as const;

type TemplateName = keyof typeof templates;

const allHTML = {} as Record<TemplateName, string>;	// eslint-disable-line @typescript-eslint/no-unsafe-type-assertion

export function renderIndex(coubs: Coub[]): string {
	const formattedCoubs = coubs.map(renderCoub);
	const content        = formattedCoubs.join('\n');

	const style  = render('style', {});
	const script = render('script', {});
	const page   = render('page', { content });
	return render('index', { style, page, script });
}

function renderCoub(coub: Coub): string {
	const permalink = ensureStringSafe(coub.permalink, 'Coub ID');
	const video     = render('video', { permalink });

	const audio = coub.file_versions.html5.audio && Object.keys(coub.file_versions.html5.audio).length > 0
		? render('audio', { permalink })
		: '';

	const fullscreen = render('fullscreen', {});

	const stats = render('stats', {
		likes: coub.likes_count.toString(),
		views: coub.views_count.toString(),
	});

	const title     = escapeString(coub.title);
	const externals = coub.media_blocks.external_raw_videos.length === 0
		? '&nbsp;'
		: coub.media_blocks.external_raw_videos.map((external) => {
				const service = ensureStringSafe(external.meta.service, 'Service name of external video');
				const url     = external.url;
				const title   = escapeString(external.title);
				return render('external', { service, url, title });
			}).join('\n');

	return render('coub', { video, audio, fullscreen, stats, title, externals });
}

function ensureStringSafe(s: unknown, description: string): string {
	if (typeof s !== 'string') {
		throw new Error(`${description} is not string but ${typeof s} and might be unsafe: ${String(s)}`);
	}

	if (!/^\w+$/.test(s)) {
		throw new Error(`${description} is not alphanumeric string and might be unsafe: ${s}`);
	}

	return s;
}

function escapeString(s: string | undefined): string | undefined {
	if (typeof s === 'undefined') { return undefined; }

	for (const { symbol, entity } of [
		{ symbol: '&', entity: '&amp;' },
		{ symbol: '"', entity: '&quot;' },
		{ symbol: '<', entity: '&lt;' },
		{ symbol: '>', entity: '&gt;' },
	]) {
		s = s.replaceAll(symbol, entity);
	}

	return s;
}

// TODO: Use react
function render<T extends TemplateName>(templateName: T, values: Record<typeof templates[T][number], string | undefined>): string {
	let html        = getTemplate(templateName);
	const allValues = values as Record<typeof templates[TemplateName][number], string | undefined>;

	for (const variable of templates[templateName]) {
		const value = allValues[variable];

		if (typeof value === 'undefined') {
			throw new Error(`Missing required value '${variable}' while rendering template '${templateName}'`);
		}

		html = html.replaceAll(`\${${variable}}`, value);
	}

	return html;
}

function getTemplate(templateName: TemplateName): string {
	if (!(templateName in allHTML)) {
		const file            = getTemplateFile(templateName);
		const template        = fs.readFileSync(file).toString().trim();
		allHTML[templateName] = template;
	}

	return allHTML[templateName];
}
