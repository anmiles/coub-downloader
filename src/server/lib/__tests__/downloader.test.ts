import fs from 'fs';
import path from 'path';
import http from 'http';
import https from 'https';

import Downloader from '../downloader';
import Renderer from '../renderer';
import Console from '../console';
import { sleep } from '../sleep';
import { createTestCoub } from '../testUtils';
import type { Coub } from '../../types/coub';

jest.mock('fs');
jest.mock('path');
jest.mock('http');
jest.mock('https');
jest.mock('../renderer');
jest.mock('../console');
jest.mock('../sleep');

const downloader = new Downloader();
downloader.mediaDirname = 'media';
downloader.htmlFilename = 'index.html';
downloader.templatePath = './src/server/templates';
downloader.sleepMilliseconds = 500;

path.join = (...paths) => paths.join('/');

describe('src/server/lib/downloader', () => {
	let logSpy: jest.SpyInstance;
		
	beforeAll(() => {
		logSpy = jest.spyOn(Console.prototype, 'log');
	});

	describe('execute', () => {
		const id1 = 'testID1';
		const id2 = 'testID2';
		const filename = 'filename';
		const script = 'script.js';
		const coub1 = createTestCoub(id1);
		const coub2 = createTestCoub(id2);
		let originalArgs: string[];

		let createDirSpy: jest.SpyInstance;
		let downloadCoubSpy: jest.SpyInstance;
		let renderSpy: jest.SpyInstance;
		let existsSyncSpy: jest.SpyInstance;
		let readFileSyncSpy: jest.SpyInstance;
		
		beforeAll(() => {
			createDirSpy = jest.spyOn(downloader, 'createDir');
			downloadCoubSpy = jest.spyOn(downloader, 'downloadCoub');
			renderSpy = jest.spyOn(Renderer.prototype, 'render');
			existsSyncSpy = jest.spyOn(fs, 'existsSync');
			readFileSyncSpy = jest.spyOn(fs, 'readFileSync');

			originalArgs = process.argv;
			process.argv = ['node', script, filename];
		});

		beforeEach(() => {
			createDirSpy.mockImplementation((dirname: string) => path.join(downloader.outputPath, dirname));
			existsSyncSpy.mockReturnValue(true);
			readFileSyncSpy.mockReturnValue(JSON.stringify([coub1, coub2]));
			downloadCoubSpy.mockImplementation((coub: Coub) => coub);
		});

		afterEach(() => {
			jest.clearAllMocks();
		});
	
		afterAll(() => {
			process.argv = originalArgs;
			jest.restoreAllMocks();
		});

		it('should set default output path', async () => {
			await downloader.execute(filename);
			expect(downloader.outputPath).toBe('output');
		});

		it('should set specified output path', async () => {
			await downloader.execute(filename, 'anotherPath');
			expect(downloader.outputPath).toBe('anotherPath');
		});

		it('should create output directory', async () => {
			await downloader.execute(filename);
			expect(createDirSpy).toBeCalledWith();
		});

		it('should create media directory', async () => {
			await downloader.execute(filename);
			expect(createDirSpy).toBeCalledWith('media');
		});

		it('should throw if filename not specified', async () => {
			const error = 'Usage: node script.js <filename> [<output_path> = "output"]';
			existsSyncSpy.mockReturnValue(false);

			await expect(downloader.execute('')).rejects.toBe(error);
		});

		it('should throw if file does not exist', async () => {
			const error = 'Filename filename does not exist; current directory is dirName';
			const dirName = 'dirName';
			jest.spyOn(path, 'resolve').mockReturnValueOnce(dirName);
			existsSyncSpy.mockReturnValue(false);
			
			await expect(downloader.execute(filename)).rejects.toBe(error);
		});

		it('should download coubs', async () => {
			await downloader.execute(filename);
			expect(downloadCoubSpy).toBeCalledWith(coub1);
			expect(downloadCoubSpy).toBeCalledWith(coub2);
		});

		it('should render coubs', async () => {
			await downloader.execute(filename);
			const htmlFile = path.join(downloader.outputPath, downloader.htmlFilename);
			expect(renderSpy).toBeCalledWith(htmlFile, downloader.templatePath, [coub1, coub2]);
		});
	});

	describe('downloadCoub', () => {
		const id = 'testID';
		const coub = createTestCoub(id);

		let selectBestURLSpy: jest.SpyInstance;
		let downloadMediaSpy: jest.SpyInstance;
		
		beforeAll(() => {
			selectBestURLSpy = jest.spyOn(downloader, 'selectBestURL');
			downloadMediaSpy = jest.spyOn(downloader, 'downloadMedia').mockResolvedValue(undefined);
		});

		beforeEach(() => {
			selectBestURLSpy.mockImplementation((coub, type) => `${type}.url`);
		});

		afterEach(() => {
			jest.clearAllMocks();
		});
	
		afterAll(() => {
			jest.restoreAllMocks();
		});
		
		it('should return coub', async () => {
			const result = await downloader.downloadCoub(coub);
			expect(result).toBe(coub);
		});

		it('should log a message', async () => {
			await downloader.downloadCoub(coub);
			expect(logSpy).toBeCalledWith('Processing testID');
		});

		it('should select best video', async () => {
			await downloader.downloadCoub(coub);
			expect(selectBestURLSpy).toBeCalledWith(coub, 'video', true);
		});

		it('should optionally select best audio', async () => {
			await downloader.downloadCoub(coub);
			expect(selectBestURLSpy).toBeCalledWith(coub, 'audio');
		});

		it('should download best video', async () => {
			await downloader.downloadCoub(coub);
			expect(downloadMediaSpy).toBeCalledWith(id, 'video.url');
		});

		it('should download best audio if any', async () => {
			await downloader.downloadCoub(coub);
			expect(downloadMediaSpy).toBeCalledWith(id, 'audio.url');
		});

		it('should not download audio if no any', async () => {
			selectBestURLSpy.mockReturnValue(undefined);
			await downloader.downloadCoub(coub);
			expect(downloadMediaSpy).not.toBeCalledWith(id, 'audio.url');
		});

		it('should download preview image', async () => {
			await downloader.downloadCoub(coub);
			expect(downloadMediaSpy).toBeCalledWith(id, 'testID.jpg');
		});

	});

	describe('downloadMedia', () => {
		const id = 'testID';
		const filename = 'filename';

		let existsSyncSpy: jest.SpyInstance;
		let createOutputFilenameSpy: jest.SpyInstance;
		let downloadFileSpy: jest.SpyInstance;
		
		beforeAll(() => {
			existsSyncSpy = jest.spyOn(fs, 'existsSync');
			createOutputFilenameSpy = jest.spyOn(downloader, 'createMediaFilename').mockReturnValue(filename);
			downloadFileSpy = jest.spyOn(downloader, 'downloadFile').mockResolvedValue(undefined as unknown as fs.WriteStream);
		});

		beforeEach(() => {
			existsSyncSpy.mockReturnValue(true);
		});

		afterEach(() => {
			jest.clearAllMocks();
		});
	
		afterAll(() => {
			jest.restoreAllMocks();
		});
		
		it('should return undefined if url is undefined', async () => {
			const url = undefined;
			const result = await downloader.downloadMedia(id, url);
			expect(result).toBeUndefined();
		});

		it('should throw if URL is not belong to whitelisted host', async () => {
			const url = 'http://wrong.url';
			const error = 'Media url http://wrong.url is not belong to any of whitelisted hosts https://coub-anubis-a.akamaized.net/ https://coub-attachments.akamaized.net/';
			await expect(() => downloader.downloadMedia(id, url)).rejects.toBe(error);
		});

		it('should create output filename', async () => {
			const url = 'https://coub-anubis-a.akamaized.net/filename.url';
			await downloader.downloadMedia(id, url);
			expect(createOutputFilenameSpy).toBeCalledWith(id, url);
		});

		it('should download file if not exists', async () => {
			existsSyncSpy.mockReturnValue(false);

			const url = 'https://coub-anubis-a.akamaized.net/filename.url';
			await downloader.downloadMedia(id, url);
			expect(downloadFileSpy).toBeCalledWith(url, filename);
		});

		it('should log a message for downloaded file', async () => {
			existsSyncSpy.mockReturnValue(false);

			const url = 'https://coub-anubis-a.akamaized.net/filename.url';
			await downloader.downloadMedia(id, url);
			expect(logSpy).toBeCalledWith('\tDownloading https://coub-anubis-a.akamaized.net/filename.url');
		});

		it('should throttle downloads', async () => {
			existsSyncSpy.mockReturnValue(false);

			const url = 'https://coub-anubis-a.akamaized.net/filename.url';
			await downloader.downloadMedia(id, url);
			expect(sleep).toBeCalledWith(downloader.sleepMilliseconds);
		});

		it('should do nothing if file exists', async () => {
			existsSyncSpy.mockReturnValue(true);

			const url = 'https://coub-anubis-a.akamaized.net/filename.url';
			await downloader.downloadMedia(id, url);
			expect(sleep).not.toBeCalled();
			expect(downloadFileSpy).not.toBeCalled();
		});
	});

	describe('downloadFile', () => {
		const filename = 'coubs.json';
		const fileStream = 'fileStream' as unknown as fs.WriteStream;

		let httpGet: jest.SpyInstance;
		let httpsGet: jest.SpyInstance;

		let failRequest: (err: Error) => void;
		let endResponse: () => void;
		
		function onRequest(event: string, listener: (err: Error) => void) {
			if (event === 'error') failRequest = listener;
			return response;
		}
		
		function onResponse(event: string, listener: () => void) {
			if (event === 'end') endResponse = listener;
			return response;
		}

		function mockGet(url: URL | string, callback: http.RequestOptions | ((res: http.IncomingMessage) => void)) {
			if (typeof callback === 'function') {
				callback(response as unknown as http.IncomingMessage);
			}
			
			return { on: onRequest } as unknown as http.ClientRequest;
		}

		const response = {on: onResponse, resume: jest.fn(), pipe: jest.fn(), statusCode: 200};
		
		beforeEach(() => {
			httpGet = jest.spyOn(http, 'get').mockImplementation(mockGet);
			httpsGet = jest.spyOn(https, 'get').mockImplementation(mockGet);
			jest.spyOn(fs, 'createWriteStream').mockReturnValue(fileStream);
			response.statusCode = 200;
		});

		afterEach(() => {
			jest.clearAllMocks();
		});
	
		afterAll(() => {
			jest.restoreAllMocks();
		});

		it('should call http.get for http urls', async () => {
			const url = 'http://test';

			const promise = downloader.downloadFile(url, filename);
			endResponse();
			await promise;

			expect(http.get).toBeCalled();
			expect(httpGet.mock.calls[0][0]).toBe(url);
		});

		it('should call https.get for https urls', async () => {
			const url = 'https://test';

			const promise = downloader.downloadFile(url, filename);
			endResponse();
			await promise;

			expect(https.get).toBeCalled();
			expect(httpsGet.mock.calls[0][0]).toBe(url);
		});

		it('should return file stream', async () => {
			const url = 'http://test';

			const promise = downloader.downloadFile(url, filename);
			endResponse();
			const result = await promise;

			expect(fs.createWriteStream).toBeCalledWith(filename);
			expect(result).toBe(fileStream);
		});

		it('should reject and resume request if statusCode !== 200', async () => {
			response.statusCode = 404;
			const url = 'http://test';

			const promise = downloader.downloadFile(url, filename);

			await expect(promise).rejects.toEqual('Request to http://test returned with status code: 404');

			expect(http.get).toBeCalled();
			expect(response.resume).toBeCalled();
			expect(httpGet.mock.calls[0][0]).toBe(url);
		});

		it('should reject on request error', async () => {
			const url = 'http://test';
			let thrownError = '';

			const promise = downloader.downloadFile(url, filename).catch(error => {
				thrownError = error;
			});

			failRequest({name: 'test error', message: 'error message'});
			await promise;
			expect(thrownError).toEqual('Request to http://test failed with error: error message');
		});
	});

	describe('selectBestURL', () => {
		const id = 'testID';

		it('should return an item with largest size', () => {
			const source = {
				high: {size: 2, url: 'highQuality'},
				highest: {size: 3, url: 'highestQuality'},
				medium: {size: 1, url: 'mediumQuality'},
			};
			const coub = createTestCoub(id, {file_versions: {html5: {video: source, audio: source}}});
	
			const result = downloader.selectBestURL(coub, 'audio');

			expect(result).toEqual('highestQuality');
		});

		it('should return undefined if file_versions key does not exist', () => {
			const coub = createTestCoub(id, {file_versions: undefined} as Partial<Coub>);
			const result = downloader.selectBestURL(coub, 'audio');
			expect(result).toBeUndefined();
		});

		it('should return undefined if html5 key does not exist', () => {
			const coub = createTestCoub(id, {file_versions: {}} as Partial<Coub>);
			const result = downloader.selectBestURL(coub, 'audio');
			expect(result).toBeUndefined();
		});

		it('should return undefined if requested key does not exist', () => {
			const coub = createTestCoub(id, {file_versions: {html5: {video: {}}}} as Partial<Coub>);
			const result = downloader.selectBestURL(coub, 'audio');
			expect(result).toBeUndefined();
		});

		it('should return undefined if there are no versions', () => {
			const coub = createTestCoub(id, {file_versions: {html5: {audio: {}, video: {}}}});
			const result = downloader.selectBestURL(coub, 'audio');
			expect(result).toBeUndefined();
		});

		it('should throw if returned value is required but undefined', () => {
			const coub = createTestCoub(id);
			const callback = () => downloader.selectBestURL(coub, 'audio', true);
			expect(callback).toThrowError(`There are no file_versions.html5.audio for coub ${id}`);
		});
	});

	describe('createDir', () => {
		const paths = ['media'];

		beforeEach(() => {
			jest.spyOn(path, 'join').mockImplementation((...paths) => paths.join('/'));
		});

		afterEach(() => {
			jest.clearAllMocks();
		});

		it('should create directory if not exists', () => {
			jest.spyOn(fs, 'existsSync').mockReturnValue(false);
			downloader.createDir(...paths);
			expect(fs.mkdirSync).toBeCalledWith('output/media', { recursive: true });
		});

		it('should not create directory if exists', () => {
			jest.spyOn(fs, 'existsSync').mockReturnValue(true);
			downloader.createDir(...paths);
			expect(fs.mkdirSync).not.toBeCalled();
		});

		it('should return combined path', () => {
			const result = downloader.createDir(...paths);
			expect(result).toBe('output/media');
		});
	});

	describe('createMediaFilename', () => {
		const id = 'testID';
		const url = 'test.url';

		beforeAll(() =>{
			jest.spyOn(downloader, 'createDir');
			jest.spyOn(path, 'join').mockImplementation((...paths) => paths.join('/'));
		});

		afterEach(() => {
			jest.clearAllMocks();
		});
		
		afterAll(() => {
			jest.restoreAllMocks();
		});
		
		it('should create output directory if needed', () => {
			downloader.createMediaFilename(id, url);
			expect(downloader.createDir).toBeCalledWith('media', 'testID');
		});
		
		it('should return combined path', () => {
			const result = downloader.createMediaFilename(id, url);
			expect(result).toBe('output/media/testID/testID.url');
		});
	});
});
