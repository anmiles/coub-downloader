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
}));

jest.mock<Partial<typeof path>>('path', () => ({
	join : jest.fn().mockImplementation((...args) => args.join('/')),
}));

const ensureDirSpy  = jest.spyOn(fs, 'ensureDir').mockImplementation((dirPath) => dirPath);
const ensureFileSpy = jest.spyOn(fs, 'ensureFile').mockImplementation((filePath) => filePath);

const profile  = 'username';
const coubID   = 'coub1';
const mediaURL = 'test.url';

const outputDir    = 'output/username';
const mediaDir     = 'output/username/media';
const templateDir  = 'src/templates';
const coubsFile    = 'input/username.json';
const profilesFile = 'input/profiles.json';
const indexFile    = 'output/username/index.html';
const mediaFile    = 'output/username/media/coub1/coub1.url';

describe('src/lib/paths', () => {
	describe('getOutputDir', () => {
		it('should call ensureDir', () => {
			original.getOutputDir(profile);

			expect(ensureDirSpy).toHaveBeenCalledWith(outputDir);
		});

		it('should return outputDir', () => {
			const result = original.getOutputDir(profile);

			expect(result).toEqual(outputDir);
		});
	});

	describe('getMediaDir', () => {
		it('should call ensureDir', () => {
			original.getMediaDir(profile);

			expect(ensureDirSpy).toHaveBeenCalledWith(mediaDir);
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

			expect(ensureFileSpy).toHaveBeenCalledWith(coubsFile);
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

			expect(ensureFileSpy).toHaveBeenCalledWith(indexFile);
		});

		it('should return likesFile', () => {
			const result = original.getIndexFile(profile);

			expect(result).toEqual(indexFile);
		});
	});

	describe('getMediaFile', () => {
		it('should call getMediaDir', () => {
			original.getMediaFile(profile, coubID, mediaURL);

			expect(paths.getMediaDir).toHaveBeenCalledWith(profile);
		});

		it('should return mediaFile', () => {
			const result = original.getMediaFile(profile, coubID, mediaURL);

			expect(result).toEqual(mediaFile);
		});
	});
});
