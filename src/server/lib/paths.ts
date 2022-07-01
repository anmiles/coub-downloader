import fs from 'fs';
import path from 'path';

import paths from './paths';

export { getOutputDir, getMediaDir, getTemplateDir, getCoubsFile, getProfilesFile, getIndexFile, getMediaFile, ensureDir, ensureFile };
export default { getOutputDir, getMediaDir, getTemplateDir, getCoubsFile, getProfilesFile, getIndexFile, getMediaFile, ensureDir, ensureFile };

const dirPaths = {
	input     : 'input',
	output    : 'output',
	templates : 'src/server/templates',
};

function getOutputDir(profile: string): string {
	return paths.ensureDir(path.join(dirPaths.output, profile));
}

function getMediaDir(profile: string): string {
	return paths.ensureDir(path.join(dirPaths.output, profile, 'media'));
}

function getTemplateDir(): string {
	return dirPaths.templates;
}

function getProfilesFile(): string {
	return path.join(dirPaths.input, 'profiles.json');
}

function getCoubsFile(profile: string): string {
	return paths.ensureFile(path.join(dirPaths.input, `${profile}.json`));
}

function getIndexFile(profile: string): string {
	return paths.ensureFile(path.join(dirPaths.output, profile, 'index.html'));
}

function getMediaFile(profile: string, coubID: string, mediaURL: string): string {
	const ext = mediaURL.split('.').pop();
	return path.join(paths.getMediaDir(profile), coubID, `${coubID}.${ext}`);
}

function ensureDir(dirPath: string) {
	if (!fs.existsSync(dirPath)) {
		fs.mkdirSync(dirPath, { recursive : true });
	}
	return dirPath;
}

function ensureFile(filePath: string) {
	paths.ensureDir(path.dirname(filePath));

	if (!fs.existsSync(filePath)) {
		fs.writeFileSync(filePath, '');
	}
	return filePath;
}
