import path from 'path';
import fs from 'fs';
import paths from './paths';
import '@anmiles/prototypes';

export { getOutputDir, getMediaDir, getTemplateDir, getCoubsFile, getProfilesFile, getIndexFile, getMediaFile };
export default { getOutputDir, getMediaDir, getTemplateDir, getCoubsFile, getProfilesFile, getIndexFile, getMediaFile };

const dirPaths = {
	input     : 'input',
	output    : 'output',
	templates : 'src/templates',
};

function getOutputDir(profile: string): string {
	return fs.ensureDir(path.join(dirPaths.output, profile));
}

function getMediaDir(profile: string): string {
	return fs.ensureDir(path.join(dirPaths.output, profile, 'media'));
}

function getTemplateDir(): string {
	return dirPaths.templates;
}

function getProfilesFile(): string {
	return path.join(dirPaths.input, 'profiles.json');
}

function getCoubsFile(profile: string): string {
	return fs.ensureFile(path.join(dirPaths.input, `${profile}.json`));
}

function getIndexFile(profile: string): string {
	return fs.ensureFile(path.join(dirPaths.output, profile, 'index.html'));
}

function getMediaFile(profile: string, coubID: string, mediaURL: string): string {
	const ext = mediaURL.split('.').pop();
	return path.join(paths.getMediaDir(profile), coubID, `${coubID}.${ext}`);
}
