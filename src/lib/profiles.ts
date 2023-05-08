import fs from 'fs';
import { getJSON, writeJSON } from './jsonLib';
import { log, warn, error } from './logger';
import { getProfilesFile } from './paths';

import profiles from './profiles';

export { getProfiles, setProfiles, create, migrate, restrictOldFiles };
export default { getProfiles, setProfiles, create, migrate, restrictOldFiles };

const oldFiles = [ './input/coubs.json' ];

function getProfiles(): string[] {
	const profilesFile = getProfilesFile();
	return getJSON(profilesFile, () => []);
}

function setProfiles(profiles: string[]): void {
	const profilesFile = getProfilesFile();
	writeJSON(profilesFile, profiles);
}

function create(profile: string): void {
	if (!profile) {
		error('Usage: `npm run create profile` where `profile` - is any profile name you want');
	}

	const existingProfiles = profiles.getProfiles();

	if (existingProfiles.includes(profile)) {
		return;
	}

	existingProfiles.push(profile);
	profiles.setProfiles(existingProfiles);
}
