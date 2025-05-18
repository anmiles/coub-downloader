import { info } from '@anmiles/logger';

import { downloadAllCoubs } from './downloader';
import { filterProfiles } from './profiles';

export async function run(profile?: string): Promise<void> {
	for (const foundProfile of filterProfiles(profile)) {
		info(`Downloading ${foundProfile}...`);
		await downloadAllCoubs(foundProfile);
	}

	info('Done!');
}
