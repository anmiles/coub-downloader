import { info } from '@anmiles/logger';

import { run } from '../app';
import { downloadAllCoubs } from '../downloader';
import { filterProfiles } from '../profiles';

jest.mock('@anmiles/logger');
jest.mock('../downloader');
jest.mock('../profiles');

const profile1 = 'username1';
const profile2 = 'username2';

jest.mocked(filterProfiles).mockReturnValue([ profile1, profile2 ]);

describe('src/lib/app', () => {
	describe('run', () => {
		it('should filter profiles', async () => {
			await run(profile1);

			expect(filterProfiles).toHaveBeenCalledWith(profile1);
		});

		it('should output info', async () => {
			await run();

			expect(info).toHaveBeenCalledWith(`Downloading ${profile1}...`);
			expect(info).toHaveBeenCalledWith(`Downloading ${profile2}...`);
			expect(info).toHaveBeenCalledWith('Done!');
		});

		it('should download coubs for all filtered profiles', async () => {
			await run();

			expect(downloadAllCoubs).toHaveBeenCalledWith(profile1);
			expect(downloadAllCoubs).toHaveBeenCalledWith(profile2);
		});
	});
});
