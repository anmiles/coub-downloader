import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import type { Coub } from 'types/coub';
import { getIndexFile, getTemplateDir } from './paths';

import renderer from './renderer';

function render(profile: string, coubs: Coub[]): void {
	const indexFile      = getIndexFile(profile);
	const templates      = renderer.getTemplates();
	const formattedCoubs = coubs.map((coub) => renderer.formatCoub(coub, templates));
	const html           = renderer.format('index', { coubs : formattedCoubs.join('\n') }, templates);
	fs.writeFileSync(indexFile, html);
}

function getTemplates(): Record<string, string> {
	const templateDir = getTemplateDir();

	return fs.readdirSync(templateDir).reduce<Record<string, string>>((obj, filename) => {
		const name = filename.split('.')[0]!;
		const html = fs.readFileSync(path.join(templateDir, filename)).toString().trim();
		obj[name]  = html;
		return obj;
	}, {});
}

function formatCoub(coub: Coub, templates: Record<string, string>): string {
	renderer.preventUnsafeString(coub.permalink, 'coub ID');

	coub.title = renderer.escapeString(coub.title);

	if (!coub.file_versions.html5.audio || Object.keys(coub.file_versions.html5.audio).length === 0) {
		_.set(coub, 'audio', '&nbsp;');
	}

	if (coub.media_blocks.external_raw_videos.length === 0) {
		_.set(coub, 'externals', '&nbsp;');
	} else {
		_.set(coub, 'externals', coub.media_blocks.external_raw_videos.map((external) => {
			renderer.preventUnsafeString(external.meta.service, 'service name of external video');
			external.title = renderer.escapeString(external.title);
			return renderer.format('external', external, templates);
		}).join('\n'));
	}

	return renderer.format('coub', coub, templates);
}

function preventUnsafeString(s: unknown, description: string): void {
	if (typeof s !== 'string') {
		throw new Error(`${description} is not string but ${typeof s} and might be unsafe: ${String(s)}`);
	}

	if (!/^\w+$/.test(s)) {
		throw new Error(`${description} is not alphanumeric string and might be unsafe: ${s}`);
	}
}

function escapeString(s: string): string {
	[
		{ symbol : '&', entity : '&amp;' },
		{ symbol : '"', entity : '&quot;' },
		{ symbol : '<', entity : '&lt;' },
		{ symbol : '>', entity : '&gt;' },
	].forEach(({ symbol, entity }) => {
		s = s.replaceAll(symbol, entity);
	});

	return s;
}

function format(rootTemplate: string, json: Record<string, unknown>, templates: Record<string, string>): string {
	const regex = /\{\{([^}]+)\}\}/g;

	let html = templates[rootTemplate];

	if (typeof html === 'undefined') {
		throw new Error(`Template '${rootTemplate}' doesn't exist or empty`);
	}

	do {
		html = html.replace(regex, (_match, key: string) => (_.get(json, key) || _.get(templates, key)) as string);
	} while (regex.test(html));

	return html;
}

export { render };
export default { render, getTemplates, formatCoub, preventUnsafeString, escapeString, format };
