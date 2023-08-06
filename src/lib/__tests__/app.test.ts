import logger from '@anmiles/logger';
import downloader from '../downloader';
import profiles from '../profiles';

import app from '../app';

jest.mock<Partial<typeof downloader>>('../downloader', () => ({
	downloadAll : jest.fn(),
}));

jest.mock<Partial<typeof logger>>('@anmiles/logger', () => ({
	info : jest.fn(),
}));

jest.mock<Partial<typeof profiles>>('../profiles', () => ({
	filterProfiles : jest.fn().mockImplementation(() => [ profile1, profile2 ]),
}));

const profile1 = 'username1';
const profile2 = 'username2';

describe('src/lib/app', () => {
	describe('run', () => {
		it('should filter profiles', async () => {
			await app.run(profile1);

			expect(profiles.filterProfiles).toHaveBeenCalledWith(profile1);
		});

		it('should output info', async () => {
			await app.run();

			expect(logger.info).toHaveBeenCalledWith(`Downloading ${profile1}...`);
			expect(logger.info).toHaveBeenCalledWith(`Downloading ${profile2}...`);
			expect(logger.info).toHaveBeenCalledWith('Done!');
		});

		it('should download coubs for all filtered profiles', async () => {
			await app.run();

			expect(downloader.downloadAll).toHaveBeenCalledWith(profile1);
			expect(downloader.downloadAll).toHaveBeenCalledWith(profile2);
		});
	});
});
