import fs from 'fs';
import path from 'path';

import paths from '../paths';
const original = jest.requireActual('../paths').default as typeof paths;
jest.mock<typeof paths>('../paths', () => ({
	getOutputDir    : jest.fn().mockImplementation(() => outputDir),
	getMediaDir     : jest.fn().mockImplementation(() => mediaDir),
	getTemplateDir  : jest.fn().mockImplementation(() => templateDir),
	getCoubsFile    : jest.fn().mockImplementation(() => coubsFile),
	getProfilesFile : jest.fn().mockImplementation(() => profilesFile),
	getIndexFile    : jest.fn().mockImplementation(() => indexFile),
	getMediaFile    : jest.fn().mockImplementation(() => mediaFile),
	ensureDir       : jest.fn().mockImplementation((dirPath) => dirPath),
	ensureFile      : jest.fn().mockImplementation((filePath) => filePath),
	dirname         : jest.fn().mockImplementation((arg) => arg.split('/').slice(0, -1).join('/')),
}));

jest.mock<Partial<typeof fs>>('fs', () => ({
	mkdirSync     : jest.fn(),
	writeFileSync : jest.fn(),
	existsSync    : jest.fn().mockImplementation(() => exists),
}));

jest.mock<Partial<typeof path>>('path', () => ({
	join    : jest.fn().mockImplementation((...args) => args.join('/')),
	dirname : jest.fn().mockImplementation((arg) => arg.split('/').slice(0, -1).join('/')),
}));

const profile  = 'username';
const dirPath  = 'dirPath';
const filePath = 'parentDir/filePath';
const coubID   = 'coub1';
const mediaURL = 'test.url';

const outputDir    = 'output/username';
const mediaDir     = 'output/username/media';
const templateDir  = 'src/server/templates';
const coubsFile    = 'input/username.json';
const profilesFile = 'input/profiles.json';
const indexFile    = 'output/username/index.html';
const mediaFile    = 'output/username/media/coub1/coub1.url';

let exists: boolean;

describe('src/lib/paths', () => {
	describe('getOutputDir', () => {
		it('should call ensureDir', () => {
			original.getOutputDir(profile);

			expect(paths.ensureDir).toBeCalledWith(outputDir);
		});

		it('should return outputDir', () => {
			const result = original.getOutputDir(profile);

			expect(result).toEqual(outputDir);
		});
	});

	describe('getMediaDir', () => {
		it('should call ensureDir', () => {
			original.getMediaDir(profile);

			expect(paths.ensureDir).toBeCalledWith(mediaDir);
		});

		it('should return mediaDir', () => {
			const result = original.getMediaDir(profile);

			expect(result).toEqual(mediaDir);
		});
	});

	describe('getTemplateDir', () => {
		it('should return templateDir', () => {
			const result = original.getTemplateDir();

			expect(result).toEqual(templateDir);
		});
	});

	describe('getCoubsFile', () => {
		it('should call ensureFile', () => {
			original.getCoubsFile(profile);

			expect(paths.ensureFile).toBeCalledWith(coubsFile);
		});

		it('should return coubsFile', () => {
			const result = original.getCoubsFile(profile);

			expect(result).toEqual(coubsFile);
		});
	});

	describe('getProfilesFile', () => {
		it('should return profilesFile', () => {
			const result = original.getProfilesFile();

			expect(result).toEqual(profilesFile);
		});
	});

	describe('getIndexFile', () => {
		it('should call ensureFile', () => {
			original.getIndexFile(profile);

			expect(paths.ensureFile).toBeCalledWith(indexFile);
		});

		it('should return likesFile', () => {
			const result = original.getIndexFile(profile);

			expect(result).toEqual(indexFile);
		});
	});

	describe('getMediaFile', () => {
		it('should call getMediaDir', () => {
			original.getMediaFile(profile, coubID, mediaURL);

			expect(paths.getMediaDir).toBeCalledWith(profile);
		});

		it('should return mediaFile', () => {
			const result = original.getMediaFile(profile, coubID, mediaURL);

			expect(result).toEqual(mediaFile);
		});
	});

	describe('ensureDir', () => {
		it('should create empty dir if not exists', () => {
			exists = false;

			original.ensureDir(dirPath);

			expect(fs.mkdirSync).toBeCalledWith(dirPath, { recursive : true });
		});

		it('should not create empty dir if already exists', () => {
			exists = true;

			original.ensureDir(dirPath);

			expect(fs.writeFileSync).not.toBeCalled();
		});

		it('should return dirPath', () => {
			const result = original.ensureDir(dirPath);

			expect(result).toEqual(dirPath);
		});
	});

	describe('ensureFile', () => {
		it('should ensure parent dir', () => {
			exists = false;

			original.ensureFile(filePath);

			expect(paths.ensureDir).toBeCalledWith('parentDir');
		});

		it('should create empty file if not exists', () => {
			exists = false;

			original.ensureFile(filePath);

			expect(fs.writeFileSync).toBeCalledWith(filePath, '');
		});

		it('should not create empty file if already exists', () => {
			exists = true;

			original.ensureFile(filePath);

			expect(fs.writeFileSync).not.toBeCalled();
		});

		it('should return filePath', () => {
			const result = original.ensureFile(filePath);

			expect(result).toEqual(filePath);
		});
	});
});
