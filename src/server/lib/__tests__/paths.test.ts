import fs from 'fs';
import path from 'path';

import paths from '../paths';
const originalPaths = jest.requireActual('../paths').default as typeof paths;
jest.mock<typeof paths>('../paths', () => ({
	getOutputDir    : jest.fn().mockImplementation(() => outputDir),
	getMediaDir     : jest.fn().mockImplementation(() => mediaDir),
	getTemplateDir  : jest.fn().mockImplementation(() => templateDir),
	getCoubsFile    : jest.fn().mockImplementation(() => coubsFile),
	getProfilesFile : jest.fn().mockImplementation(() => profilesFile),
	getIndexFile    : jest.fn().mockImplementation(() => indexFile),
	getMediaFile    : jest.fn().mockImplementation(() => mediaFile),
}));

const originalPath = jest.requireActual('path') as typeof path;
jest.mock<Partial<typeof path>>('path', () => ({
	join    : jest.fn().mockImplementation((...args) => args.join('/')),
	dirname : jest.fn().mockImplementation((_path) => originalPath.dirname(_path)),
}));

const ensureDirSpy  = jest.spyOn(fs, 'ensureDir').mockImplementation(() => ({ created : false, exists : true }));
const ensureFileSpy = jest.spyOn(fs, 'ensureFile').mockImplementation(() => ({ created : false, exists : true }));

const profile  = 'username';
const coubID   = 'coub1';
const mediaURL = 'test.url';

const outputDir    = 'output/username';
const mediaDir     = 'output/username/media';
const templateDir  = 'src/server/templates';
const coubsFile    = 'input/username.json';
const profilesFile = 'input/profiles.json';
const indexFile    = 'output/username/index.html';
const mediaFile    = 'output/username/media/coub1/coub1.url';

describe('src/lib/paths', () => {
	describe('getOutputDir', () => {
		it('should call ensureDir', () => {
			originalPaths.getOutputDir(profile);

			expect(ensureDirSpy).toHaveBeenCalledWith(outputDir, { create : true });
		});

		it('should return outputDir', () => {
			const result = originalPaths.getOutputDir(profile);

			expect(result).toEqual(outputDir);
		});
	});

	describe('getMediaDir', () => {
		it('should call ensureDir', () => {
			originalPaths.getMediaDir(profile);

			expect(ensureDirSpy).toHaveBeenCalledWith(mediaDir, { create : true });
		});

		it('should return mediaDir', () => {
			const result = originalPaths.getMediaDir(profile);

			expect(result).toEqual(mediaDir);
		});
	});

	describe('getTemplateDir', () => {
		it('should return templateDir', () => {
			const result = originalPaths.getTemplateDir();

			expect(result).toEqual(templateDir);
		});
	});

	describe('getCoubsFile', () => {
		it('should call ensureFile', () => {
			originalPaths.getCoubsFile(profile);

			expect(ensureFileSpy).toHaveBeenCalledWith(coubsFile, { create : true });
		});

		it('should return coubsFile', () => {
			const result = originalPaths.getCoubsFile(profile);

			expect(result).toEqual(coubsFile);
		});
	});

	describe('getProfilesFile', () => {
		it('should return profilesFile', () => {
			const result = originalPaths.getProfilesFile();

			expect(result).toEqual(profilesFile);
		});
	});

	describe('getIndexFile', () => {
		it('should call ensureFile', () => {
			originalPaths.getIndexFile(profile);

			expect(ensureFileSpy).toHaveBeenCalledWith(indexFile, { create : true });
		});

		it('should return likesFile', () => {
			const result = originalPaths.getIndexFile(profile);

			expect(result).toEqual(indexFile);
		});
	});

	describe('getMediaFile', () => {
		it('should call getMediaDir', () => {
			originalPaths.getMediaFile(profile, coubID, mediaURL);

			expect(paths.getMediaDir).toHaveBeenCalledWith(profile);
		});

		it('should ensure parent dir', () => {
			originalPaths.getMediaFile(profile, coubID, mediaURL);

			expect(ensureDirSpy).toHaveBeenCalledWith(path.dirname(mediaFile), { create : true });
		});

		it('should return mediaFile', () => {
			const result = originalPaths.getMediaFile(profile, coubID, mediaURL);

			expect(result).toEqual(mediaFile);
		});
	});
});
