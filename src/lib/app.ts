import { download } from './downloader';
import { info, error } from './logger';
import { getProfiles } from './profiles';

export { run };
export default { run };

async function run(profile?: string): Promise<void> {
	const profiles = getProfiles().filter((p) => !profile || p === profile);

	if (profiles.length === 0) {
		error('Please `npm run create` at least one profile');
	}

	for (const profile of profiles) {
		info(`Downloading ${profile}...`);
		await download(profile);
	}

	info('Done!');
}

