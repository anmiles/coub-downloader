import fs from 'fs';
import '@anmiles/prototypes';
import logger from '@anmiles/logger';
import sleep from '@anmiles/sleep';
import download from '@anmiles/downloader';
import type { Coub } from 'types/coub';
import paths from '../paths';
import renderer from '../renderer';
import { createTestCoub } from '../testUtils';

import downloader from '../downloader';

const original = jest.requireActual<{ default : typeof downloader }>('../downloader').default;
jest.mock<typeof downloader>('../downloader', () => ({
	downloadAll   : jest.fn(),
	downloadCoub  : jest.fn(),
	downloadMedia : jest.fn(),
	selectBestURL : jest.fn().mockImplementation((_coub, key, required) => required || fileExists ? `${key}.url` : undefined),
}));

jest.mock<Partial<typeof download>>('@anmiles/downloader', () => ({
	download : jest.fn().mockImplementation(),
}));

jest.mock<Partial<typeof fs>>('fs', () => ({
	existsSync : jest.fn().mockImplementation(() => fileExists),
}));

jest.mock<Partial<typeof logger>>('@anmiles/logger', () => ({
	log  : jest.fn(),
	info : jest.fn(),
}));

jest.mock<Partial<typeof paths>>('../paths', () => ({
	getCoubsFile : jest.fn().mockImplementation(() => coubsFile),
	getMediaFile : jest.fn().mockImplementation(() => mediaFile),
	ensureFile   : jest.fn(),
}));

jest.mock<Partial<typeof renderer>>('../renderer', () => ({
	render : jest.fn(),
}));

jest.mock<typeof sleep>('@anmiles/sleep', () => jest.fn());

const profile           = 'username';
const coubsFile         = 'coubsFile';
const mediaFile         = 'mediaFile';
const id1               = 'testID1';
const id2               = 'testID2';
const coub1             = createTestCoub(id1);
const coub2             = createTestCoub(id2);
const coubs             = [ coub1, coub2 ];
const sleepMilliseconds = 500;

let url: string;
let fileExists: boolean;

const coubsError = `Coubs json ${coubsFile} doesn't exist. Refer to README.md in order to obtain it`;

const getJSONSpy = jest.spyOn(fs, 'getJSON').mockImplementation(() => coubs);
jest.spyOn(fs, 'writeJSON').mockImplementation();

beforeEach(() => {
	url        = 'https://coub-anubis-a.akamaized.net/filename.url';
	fileExists = true;
});

describe('src/lib/downloader', () => {
	describe('downloadAll', () => {
		it('should get coubs file', async () => {
			await original.downloadAll(profile);

			expect(paths.getCoubsFile).toHaveBeenCalledWith(profile);
		});

		it('should get json from coubs file', async () => {
			await original.downloadAll(profile);

			expect(getJSONSpy).toHaveBeenCalled();
			expect(getJSONSpy.mock.calls[0]?.[0]).toEqual(coubsFile);
		});

		it('should fallback to error', async () => {
			await original.downloadAll(profile);

			expect(getJSONSpy.mock.calls[0]?.[1]).toThrow(coubsError);
		});

		it('should download each coub', async () => {
			await original.downloadAll(profile);

			coubs.forEach((coub) => {
				expect(downloader.downloadCoub).toHaveBeenCalledWith(profile, coub);
			});
		});

		it('should render coubs', async () => {
			await original.downloadAll(profile);

			expect(renderer.render).toHaveBeenCalledWith(profile, coubs);
		});
	});

	describe('downloadCoub', () => {
		it('should log a message', async () => {
			await original.downloadCoub(profile, coub1);

			expect(logger.log).toHaveBeenCalledWith('Processing testID1');
		});

		it('should select best video', async () => {
			await original.downloadCoub(profile, coub1);

			expect(downloader.selectBestURL).toHaveBeenCalledWith(coub1, 'video', true);
		});

		it('should optionally select best audio', async () => {
			await original.downloadCoub(profile, coub1);

			expect(downloader.selectBestURL).toHaveBeenCalledWith(coub1, 'audio');
		});

		it('should download best video', async () => {
			await original.downloadCoub(profile, coub1);

			expect(downloader.downloadMedia).toHaveBeenCalledWith(profile, id1, 'video.url');
		});

		it('should download best audio if any', async () => {
			await original.downloadCoub(profile, coub1);

			expect(downloader.downloadMedia).toHaveBeenCalledWith(profile, id1, 'audio.url');
		});

		it('should not download audio if no any', async () => {
			fileExists = false;

			await original.downloadCoub(profile, coub1);

			expect(downloader.downloadMedia).not.toHaveBeenCalledWith(profile, id1, 'audio.url');
		});

		it('should download preview image', async () => {
			await original.downloadCoub(profile, coub1);

			expect(downloader.downloadMedia).toHaveBeenCalledWith(profile, id1, 'testID1.jpg');
		});

		it('should return coub', async () => {
			const result = await original.downloadCoub(profile, coub1);

			expect(result).toBe(coub1);
		});
	});

	describe('downloadMedia', () => {
		it('should not download if url is undefined', async () => {
			const url = undefined;

			await original.downloadMedia(profile, id1, url);

			expect(download.download).not.toHaveBeenCalled();
		});

		it('should throw if URL is not belong to whitelisted host', async () => {
			const url   = 'http://wrong.url';
			const error = 'Media url http://wrong.url is not belong to any of whitelisted hosts https://coub-anubis-a.akamaized.net/ https://coub-attachments.akamaized.net/ https://3fc4ed44-3fbc-419a-97a1-a29742511391.selcdn.net/';

			const func = async (): Promise<void> => original.downloadMedia(profile, id1, url);

			await expect(func).rejects.toEqual(new Error(error));
		});

		it('should get media file', async () => {
			await original.downloadMedia(profile, id1, url);

			expect(paths.getMediaFile).toHaveBeenCalledWith(profile, id1, url);
		});

		describe('media file does not exist', () => {
			beforeEach(() => {
				fileExists = false;
			});

			it('should download file if not exists', async () => {
				await original.downloadMedia(profile, id1, url);

				expect(download.download).toHaveBeenCalledWith(url, mediaFile);
			});

			it('should log a message for downloaded file', async () => {
				await original.downloadMedia(profile, id1, url);

				expect(logger.info).toHaveBeenCalledWith(`\tDownloading ${url}`);
			});

			it('should throttle downloads', async () => {
				await original.downloadMedia(profile, id1, url);

				expect(sleep).toHaveBeenCalledWith(sleepMilliseconds);
			});
		});

		describe('media file exists', () => {
			it('should not download existing', async () => {
				await original.downloadMedia(profile, id1, url);

				expect(download.download).not.toHaveBeenCalled();
			});

			it('should not log a message', async () => {
				await original.downloadMedia(profile, id1, url);

				expect(logger.log).not.toHaveBeenCalledWith(`\tDownloading ${url}`);
			});

			it('should not sleep', async () => {
				await original.downloadMedia(profile, id1, url);

				expect(sleep).not.toHaveBeenCalled();
			});
		});
	});

	describe('selectBestURL', () => {
		it('should return an item with largest size', () => {
			const source = {
				high    : { size : 2, url : 'highQuality' },
				highest : { size : 3, url : 'highestQuality' },
				medium  : { size : 1, url : 'mediumQuality' },
			};
			const coub   = createTestCoub(id1, { file_versions : { html5 : { video : source, audio : source } } });

			const result = original.selectBestURL(coub, 'audio');

			expect(result).toEqual('highestQuality');
		});

		it('should return undefined if requested key does not exist', () => {
			const coub = createTestCoub(id1, { file_versions : { html5 : { video : {} } } } as Partial<Coub>);

			const result = original.selectBestURL(coub, 'audio');

			expect(result).toBeUndefined();
		});

		it('should return undefined if there are no versions', () => {
			const coub = createTestCoub(id1, { file_versions : { html5 : { audio : {}, video : {} } } });

			const result = original.selectBestURL(coub, 'audio');

			expect(result).toBeUndefined();
		});

		it('should throw if returned value is required but undefined', () => {
			const coub = createTestCoub(id1);

			const callback = (): string | undefined => original.selectBestURL(coub, 'audio', true);

			expect(callback).toThrow(`There are no file_versions.html5.audio for coub ${id1}`);
		});
	});
});
