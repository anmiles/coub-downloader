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
	getProfiles : jest.fn().mockImplementation(() => existingProfiles),
}));

const profile1 = 'username1';
const profile2 = 'username2';

let existingProfiles: string[];

beforeEach(() => {
	existingProfiles = [ profile1, profile2 ];
});

describe('src/lib/app', () => {
	describe('run', () => {
		it('should get profiles', async () => {
			await app.run();

			expect(profiles.getProfiles).toHaveBeenCalled();
		});

		it('should output error if no profiles', async () => {
			existingProfiles = [];

			const func = () => app.run();

			await expect(func).rejects.toEqual('Please `npm run create` at least one profile');
		});

		it('should output info', async () => {
			await app.run();

			expect(logger.info).toHaveBeenCalledWith(`Downloading ${profile1}...`);
			expect(logger.info).toHaveBeenCalledWith(`Downloading ${profile2}...`);
			expect(logger.info).toHaveBeenCalledWith('Done!');
		});

		it('should download coubs for all profiles', async () => {
			await app.run();

			expect(downloader.downloadAll).toHaveBeenCalledWith(profile1);
			expect(downloader.downloadAll).toHaveBeenCalledWith(profile2);
		});

		it('should download coubs only for specified profile', async () => {
			await app.run(profile1);

			expect(downloader.downloadAll).toHaveBeenCalledWith(profile1);
			expect(downloader.downloadAll).not.toHaveBeenCalledWith(profile2);
		});
	});
});
