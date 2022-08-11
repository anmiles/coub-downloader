/* eslint-disable camelcase */
import fs from 'fs';
import axios from 'axios';
import type { AxiosResponse } from 'axios';
import jsonLib from '../jsonLib';
import logger from '../logger';
import paths from '../paths';
import renderer from '../renderer';
import sleep from '../sleep';
import { createTestCoub } from '../testUtils';
import type { Coub } from '../../types';

import downloader from '../downloader';
const original = jest.requireActual('../downloader').default as typeof downloader;
jest.mock<typeof downloader>('../downloader', () => ({
	download      : jest.fn().mockImplementation(() => {}),
	downloadCoub  : jest.fn().mockImplementation(() => {}),
	downloadMedia : jest.fn().mockImplementation(() => {}),
	downloadFile  : jest.fn().mockImplementation(() => {}),
	selectBestURL : jest.fn().mockImplementation((coub, key, required) => required || fileExists ? `${key}.url` : undefined),
}));

jest.mock('axios', () => jest.fn().mockImplementation(() => axiosResponse));

jest.mock<Partial<typeof fs>>('fs', () => ({
	writeFileSync : jest.fn(),
	existsSync    : jest.fn().mockImplementation(() => fileExists),
}));

jest.mock<Partial<typeof jsonLib>>('../jsonLib', () => ({
	getJSON : jest.fn().mockImplementation(() => coubs),
}));

jest.mock<Partial<typeof logger>>('../logger', () => ({
	log   : jest.fn(),
	info  : jest.fn(),
	error : jest.fn().mockImplementation((error) => {
		throw error;
	}) as jest.Mock<never, any>,
}));

jest.mock<Partial<typeof paths>>('../paths', () => ({
	getCoubsFile : jest.fn().mockImplementation(() => coubsFile),
	getMediaFile : jest.fn().mockImplementation(() => mediaFile),
	ensureFile   : jest.fn(),
}));

jest.mock<Partial<typeof renderer>>('../renderer', () => ({
	render : jest.fn(),
}));

jest.mock<Partial<typeof sleep>>('../sleep', () => ({
	sleep : jest.fn(),
}));

const profile           = 'username';
const coubsFile         = 'coubsFile';
const mediaFile         = 'mediaFile';
const id1               = 'testID1';
const id2               = 'testID2';
const coub1             = createTestCoub(id1);
const coub2             = createTestCoub(id2);
const coubs             = [ coub1, coub2 ];
const sleepMilliseconds = 500;
const filename          = 'filename';
const fileData          = Buffer.from('fileData');

let url: string;
let fileExists: boolean;
let axiosResponse: Partial<AxiosResponse>;

const coubsError = `Coubs json ${coubsFile} doesn't exist. Refer to README.md in order to obtain it`;

const getJSONSpy = jest.spyOn(jsonLib, 'getJSON').mockReturnValue(coubs);

beforeEach(() => {
	url           = 'https://coub-anubis-a.akamaized.net/filename.url';
	fileExists    = true;
	axiosResponse = {
		data   : fileData,
		status : 200,
	};
});

describe('src/lib/downloader', () => {
	describe('download', () => {
		it('should get coubs file', async () => {
			await original.download(profile);

			expect(paths.getCoubsFile).toBeCalledWith(profile);
		});

		it('should get json from coubs file', async () => {
			await original.download(profile);

			expect(getJSONSpy).toBeCalled();
			expect(getJSONSpy.mock.calls[0][0]).toEqual(coubsFile);
		});

		it('should fallback to error', async () => {
			await original.download(profile);

			expect(getJSONSpy.mock.calls[0][1]).toThrowError(coubsError);
		});

		it('should download each coub', async () => {
			await original.download(profile);

			coubs.forEach((coub) => {
				expect(downloader.downloadCoub).toBeCalledWith(profile, coub);
			});
		});

		it('should render coubs', async () => {
			await original.download(profile);

			expect(renderer.render).toBeCalledWith(profile, coubs);
		});
	});

	describe('downloadCoub', () => {
		it('should log a message', async () => {
			await original.downloadCoub(profile, coub1);

			expect(logger.log).toBeCalledWith('Processing testID1');
		});

		it('should select best video', async () => {
			await original.downloadCoub(profile, coub1);

			expect(downloader.selectBestURL).toBeCalledWith(coub1, 'video', true);
		});

		it('should optionally select best audio', async () => {
			await original.downloadCoub(profile, coub1);

			expect(downloader.selectBestURL).toBeCalledWith(coub1, 'audio');
		});

		it('should download best video', async () => {
			await original.downloadCoub(profile, coub1);

			expect(downloader.downloadMedia).toBeCalledWith(profile, id1, 'video.url');
		});

		it('should download best audio if any', async () => {
			await original.downloadCoub(profile, coub1);

			expect(downloader.downloadMedia).toBeCalledWith(profile, id1, 'audio.url');
		});

		it('should not download audio if no any', async () => {
			fileExists = false;

			await original.downloadCoub(profile, coub1);

			expect(downloader.downloadMedia).not.toBeCalledWith(profile, id1, 'audio.url');
		});

		it('should download preview image', async () => {
			await original.downloadCoub(profile, coub1);

			expect(downloader.downloadMedia).toBeCalledWith(profile, id1, 'testID1.jpg');
		});

		it('should return coub', async () => {
			const result = await original.downloadCoub(profile, coub1);

			expect(result).toBe(coub1);
		});
	});

	describe('downloadMedia', () => {
		it('should return undefined if url is undefined', async () => {
			const url = undefined;

			const result = await original.downloadMedia(profile, id1, url);

			expect(result).toBeUndefined();
		});

		it('should throw if URL is not belong to whitelisted host', async () => {
			const url   = 'http://wrong.url';
			const error = 'Media url http://wrong.url is not belong to any of whitelisted hosts https://coub-anubis-a.akamaized.net/ https://coub-attachments.akamaized.net/';

			const func = () => original.downloadMedia(profile, id1, url);

			await expect(func).rejects.toBe(error);
		});

		it('should get media file', async () => {
			await original.downloadMedia(profile, id1, url);

			expect(paths.getMediaFile).toBeCalledWith(profile, id1, url);
		});

		describe('media file does not exist', () => {
			beforeEach(() => {
				fileExists = false;
			});

			it('should download file if not exists', async () => {
				await original.downloadMedia(profile, id1, url);

				expect(downloader.downloadFile).toBeCalledWith(url, mediaFile);
			});

			it('should log a message for downloaded file', async () => {
				await original.downloadMedia(profile, id1, url);

				expect(logger.info).toBeCalledWith(`\tDownloading ${url}`);
			});

			it('should throttle downloads', async () => {
				await original.downloadMedia(profile, id1, url);

				expect(sleep.sleep).toBeCalledWith(sleepMilliseconds);
			});
		});

		describe('media file exists', () => {
			it('should not download existing', async () => {
				await original.downloadMedia(profile, id1, url);

				expect(downloader.downloadFile).not.toBeCalled();
			});

			it('should not log a message', async () => {
				await original.downloadMedia(profile, id1, url);

				expect(logger.log).not.toBeCalledWith(`\tDownloading ${url}`);
			});

			it('should not sleep', async () => {
				await original.downloadMedia(profile, id1, url);

				expect(sleep.sleep).not.toBeCalled();
			});
		});
	});

	describe('downloadFile', () => {
		it('should get arraybuffer from axios', async () => {
			await original.downloadFile(url, filename);

			expect(axios).toBeCalledWith({ url, method : 'GET', responseType : 'arraybuffer' });
		});

		it('should throw error if status code is not 200', async () => {
			axiosResponse.status = 404;

			const func = () => original.downloadFile(url, filename);

			await expect(func()).rejects.toEqual(`Request to ${url} returned with status code: 404`);
		});

		it('should ensure file path', async () => {
			await original.downloadFile(url, filename);

			expect(paths.ensureFile).toBeCalledWith(filename);
		});

		it('should write data to file if status code is 200', async () => {
			await original.downloadFile(url, filename);

			expect(fs.writeFileSync).toBeCalledWith(filename, fileData);
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

		it('should return undefined if file_versions key does not exist', () => {
			const coub = createTestCoub(id1, { file_versions : undefined } as Partial<Coub>);

			const result = original.selectBestURL(coub, 'audio');

			expect(result).toBeUndefined();
		});

		it('should return undefined if html5 key does not exist', () => {
			const coub = createTestCoub(id1, { file_versions : {} } as Partial<Coub>);

			const result = original.selectBestURL(coub, 'audio');

			expect(result).toBeUndefined();
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

			const callback = () => original.selectBestURL(coub, 'audio', true);

			expect(callback).toThrowError(`There are no file_versions.html5.audio for coub ${id1}`);
		});
	});
});
