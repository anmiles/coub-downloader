import { info } from '@anmiles/logger';
import { downloadAll } from './downloader';
import { filterProfiles } from './profiles';

async function run(profile?: string): Promise<void> {
	for (const foundProfile of filterProfiles(profile)) {
		info(`Downloading ${foundProfile}...`);
		await downloadAll(foundProfile);
	}

	info('Done!');
}

export { run };
export default { run };

