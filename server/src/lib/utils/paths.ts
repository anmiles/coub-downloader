import path from 'path';

import type { templates } from '../renderer';

const dirPaths = {
	input    : 'input',
	output   : 'output',
	// TODO: Remove this hack after moving to React
	templates: path.relative(process.cwd(), path.join(__dirname, '../../templates')),
};

export function getCoubsFile(profile: string): string {
	return path.join(dirPaths.input, `${profile}.json`);
}

export function getProfileDir(profile: string): string {
	return path.join(dirPaths.output, profile);
}

export function getIndexFile(profile: string): string {
	return path.join(getProfileDir(profile), 'index.html');
}

export function getMediaDir(profile: string): string {
	return path.join(getProfileDir(profile), 'media');
}

export function getMediaFile(profile: string, coubID: string, mediaURL: string): string {
	const ext = mediaURL.split('.').pop();
	return path.join(getMediaDir(profile), coubID, `${coubID}.${ext}`);
}

export function getProfilesFile(): string {
	return path.join(dirPaths.input, 'profiles.json');
}

export function getTemplateFile(templateName: keyof typeof templates): string {
	return path.join(dirPaths.templates, `${templateName}.html`);
}
