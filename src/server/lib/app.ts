import { download } from './downloader';
import { info } from './logger';
import { restrictOldFiles, getProfiles } from './profiles';

export { run };
export default { run };

async function run(): Promise<void> {
	restrictOldFiles();
	const profiles = getProfiles();

	for (const profile of profiles) {
		info(`Downloading ${profile}...`);
		await download(profile);
	}

	info('Done!');
}

