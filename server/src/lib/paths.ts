import path from 'path';
import fs from 'fs';
import paths from './paths';
import '@anmiles/prototypes';

const dirPaths = {
	input     : 'input',
	output    : 'output',
	templates : 'src/server/templates',
};

function getOutputDir(profile: string): string {
	const dir = path.join(dirPaths.output, profile);
	fs.ensureDir(dir, { create : true });
	return dir;
}

function getMediaDir(profile: string): string {
	const dir = path.join(dirPaths.output, profile, 'media');
	fs.ensureDir(dir, { create : true });
	return dir;
}

function getTemplateDir(): string {
	return dirPaths.templates;
}

function getProfilesFile(): string {
	return path.join(dirPaths.input, 'profiles.json');
}

function getCoubsFile(profile: string): string {
	const file = path.join(dirPaths.input, `${profile}.json`);
	fs.ensureFile(file, { create : true });
	return file;
}

function getIndexFile(profile: string): string {
	const file = path.join(dirPaths.output, profile, 'index.html');
	fs.ensureFile(file, { create : true });
	return file;
}

function getMediaFile(profile: string, coubID: string, mediaURL: string): string {
	const ext = mediaURL.split('.').pop();
	const dir = path.join(paths.getMediaDir(profile), coubID);
	fs.ensureDir(dir, { create : true });
	return path.join(dir, `${coubID}.${ext}`);
}

export { getOutputDir, getMediaDir, getTemplateDir, getCoubsFile, getProfilesFile, getIndexFile, getMediaFile };
export default { getOutputDir, getMediaDir, getTemplateDir, getCoubsFile, getProfilesFile, getIndexFile, getMediaFile };
