import { info } from '@anmiles/logger';
import { downloadAll } from './downloader';
import { filterProfiles } from './profiles';

export { run };
export default { run };

async function run(profile?: string): Promise<void> {
	for (const foundProfile of filterProfiles(profile)) {
		info(`Downloading ${foundProfile}...`);
		await downloadAll(foundProfile);
	}

	info('Done!');
}

