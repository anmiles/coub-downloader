import downloader from '../downloader';
import logger from '../logger';
import profiles from '../profiles';

import app from '../app';

jest.mock<Partial<typeof downloader>>('../downloader', () => ({
	download : jest.fn(),
}));

jest.mock<Partial<typeof logger>>('../logger', () => ({
	info  : jest.fn(),
	error : jest.fn().mockImplementation(() => {
		throw mockError;
	}),
}));

jest.mock<Partial<typeof profiles>>('../profiles', () => ({
	getProfiles      : jest.fn().mockImplementation(() => existingProfiles),
	restrictOldFiles : jest.fn(),
}));

const profile1 = 'username1';
const profile2 = 'username2';

const mockError = 'mockError';

let existingProfiles: string[];

beforeEach(() => {
	existingProfiles = [ profile1, profile2 ];
});

describe('src/server/lib/app', () => {
	describe('run', () => {
		it('should restrict old files', async () => {
			await app.run();

			expect(profiles.restrictOldFiles).toBeCalled();
		});

		it('should get profiles', async () => {
			await app.run();

			expect(profiles.getProfiles).toBeCalled();
		});

		it('should output error if no profiles', async () => {
			existingProfiles = [];

			const func = () => app.run();

			await expect(func).rejects.toEqual(mockError);
			expect(logger.error).toBeCalledWith('Please `npm run create` at least one profile');
		});

		it('should output info', async () => {
			await app.run();

			expect(logger.info).toBeCalledWith(`Downloading ${profile1}...`);
			expect(logger.info).toBeCalledWith(`Downloading ${profile2}...`);
			expect(logger.info).toBeCalledWith('Done!');
		});

		it('should download coubs for each profile', async () => {
			await app.run();

			expect(downloader.download).toBeCalledWith(profile1);
			expect(downloader.download).toBeCalledWith(profile2);
		});
	});
});
