import fs from 'fs';
import path from 'path';

import { download } from '@anmiles/downloader';
import '@anmiles/jest-extensions';
import '@anmiles/prototypes';
import sleep from '@anmiles/sleep';
import mockFs from 'mock-fs';

import { downloadAllCoubs } from '../downloader';
import { renderIndex } from '../renderer';
import { getCoubsFile, getProfileDir } from '../utils/paths';

import { createTestCoub } from './utils/testUtils';

jest.mock('@anmiles/logger');
jest.mock('@anmiles/sleep');
jest.mock('@anmiles/downloader');
jest.mock('../renderer');

const profile = 'username';

const coub1 = createTestCoub('testID1', {
	picture      : 'https://coub-anubis-a.akamaized.net/poster-1.jpg',
	file_versions: {
		html5: {
			video: {
				low : { url: 'https://coub-anubis-a.akamaized.net/low-1.mp4', size: 10 },
				high: { url: 'https://coub-anubis-a.akamaized.net/high-1.mp4', size: 50 },
			},
		},
	},
});

const coub2 = createTestCoub('testID2', {
	picture      : 'https://coub-anubis-a.akamaized.net/poster-2.jpg',
	file_versions: {
		html5: {
			video: {
				high: { url: 'https://coub-anubis-a.akamaized.net/high-2.mov', size: 60 },
				low : { url: 'https://coub-anubis-a.akamaized.net/low-2.mov', size: 20 },
			},
			audio: {
				low : { size: 30, url: 'https://coub-attachments.akamaized.net/low-2.mp3' },
				high: { size: 70, url: 'https://coub-attachments.akamaized.net/high-2.mp3' },
			},
		},
	},
});

const coubs             = [ coub1, coub2 ];
const sleepMilliseconds = 500;

const profileDir = getProfileDir(profile);
const coubsFile  = getCoubsFile(profile);

jest.mocked(renderIndex).mockReturnValue('<html>page</html>');
jest.mocked(download).mockImplementation(async (url, filename) => {
	fs.ensureDir(path.dirname(filename));
	await fs.promises.writeFile(filename, url);
});

beforeEach(() => {
	mockFs({
		[coubsFile]: JSON.stringify(coubs),
	});
});

afterAll(() => {
	mockFs.restore();
});

describe('src/lib/downloader', () => {
	describe('downloadAllCoubs', () => {
		it('should download all expected files', async () => {
			await downloadAllCoubs(profile);

			expect(profileDir).toMatchFiles({
				'output/username/index.html': '<html>page</html>',

				'output/username/media/testID1/testID1.jpg': 'https://coub-anubis-a.akamaized.net/poster-1.jpg',
				'output/username/media/testID1/testID1.mp4': 'https://coub-anubis-a.akamaized.net/high-1.mp4',

				'output/username/media/testID2/testID2.jpg': 'https://coub-anubis-a.akamaized.net/poster-2.jpg',
				'output/username/media/testID2/testID2.mov': 'https://coub-anubis-a.akamaized.net/high-2.mov',
				'output/username/media/testID2/testID2.mp3': 'https://coub-attachments.akamaized.net/high-2.mp3',
			});
		});

		it('should throttle downloads', async () => {
			await downloadAllCoubs(profile);

			expect(sleep).toHaveBeenCalledTimes(5);
			expect(sleep).toHaveBeenCalledWith(sleepMilliseconds);
		});

		it('should throw if URL is not belong to whitelisted host', async () => {
			const url   = 'http://wrong.url';
			const error = 'Media url http://wrong.url is not belong to any of whitelisted hosts https://coub-anubis-a.akamaized.net/ https://coub-attachments.akamaized.net/ https://3fc4ed44-3fbc-419a-97a1-a29742511391.selcdn.net/';

			const wrongCoub = createTestCoub('wrong-url', {
				file_versions: {
					html5: {
						video: {
							wrong: { url, size: 10 },
						},
					},
				},
			});

			mockFs({
				[coubsFile]: JSON.stringify([ wrongCoub ]),
			});

			const func = async (): Promise<void> => downloadAllCoubs(profile);

			await expect(func).rejects.toEqual(new Error(error));
		});

		it('should throw if a coub does not have video link', async () => {
			const wrongCoub = createTestCoub('incorrect', {
				file_versions: {
					html5: {
						video: {},
					},
				},
			});

			mockFs({
				[coubsFile]: JSON.stringify([ wrongCoub ]),
			});

			const func = async (): Promise<void> => downloadAllCoubs(profile);

			await expect(func).rejects.toEqual(new Error('There are no file_versions.html5.video for coub incorrect'));
		});

		it('should throw if a coub from JSON does not match schema', async () => {
			const wrongCoub = createTestCoub('incorrect', {
				permalink: undefined,
			});

			mockFs({
				[coubsFile]: JSON.stringify([ wrongCoub ]),
			});

			const func = async (): Promise<void> => downloadAllCoubs(profile);

			await expect(func).rejects.toEqual(new Error('Validation failed:\n\tpermalink (Required)'));
		});

		it('should throw if coub file does not exist', async () => {
			mockFs({});

			const func = async (): Promise<void> => downloadAllCoubs(profile);

			await expect(func).rejects.toEqual(new Error(`Coubs json input${path.sep}username.json doesn't exist. Refer to README.md in order to obtain it`));
		});
	});
});
