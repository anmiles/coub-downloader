import fs from 'fs';
import jsonLib from '../jsonLib';
import logger from '../logger';
import paths from '../paths';

import profiles from '../profiles';
const original = jest.requireActual('../profiles').default as typeof profiles;
jest.mock<typeof profiles>('../profiles', () => ({
	getProfiles      : jest.fn().mockImplementation(() => existingProfiles),
	setProfiles      : jest.fn(),
	restrictOldFiles : jest.fn(),
	create           : jest.fn(),
	migrate          : jest.fn(),
}));

jest.mock<Partial<typeof fs>>('fs', () => ({
	mkdirSync     : jest.fn(),
	renameSync    : jest.fn(),
	writeFileSync : jest.fn(),
	existsSync    : jest.fn().mockImplementation((file) => existingFiles.includes(file)),
}));

jest.mock<Partial<typeof jsonLib>>('../jsonLib', () => ({
	getJSON   : jest.fn().mockImplementation(() => json),
	writeJSON : jest.fn(),
}));

jest.mock<Partial<typeof logger>>('../logger', () => ({
	log   : jest.fn(),
	warn  : jest.fn(),
	error : jest.fn().mockImplementation((error) => {
		throw error;
	}) as jest.Mock<never, any>,
}));

jest.mock<Partial<typeof paths>>('../paths', () => ({
	getProfilesFile : jest.fn().mockImplementation(() => profilesFile),
}));

const json             = { key : 'value' };
const existingProfiles = [ 'username1', 'username2' ];
const profilesFile     = 'profilesFile';
const profile1         = 'username1';
const profile2         = 'username2';
const allProfiles      = [ profile1, profile2 ];

let existingFiles: string[] = [];

beforeEach(() => {
	existingFiles = [];
});

describe('src/lib/profiles', () => {

	describe('getProfiles', () => {
		const getJSONSpy = jest.spyOn(jsonLib, 'getJSON');

		it('should get json from profiles file', () => {
			original.getProfiles();

			expect(getJSONSpy).toHaveBeenCalled();
			expect(getJSONSpy.mock.calls[0][0]).toEqual(profilesFile);
		});

		it('should fallback to empty profiles array', () => {
			original.getProfiles();

			const fallback = getJSONSpy.mock.calls[0][1];

			expect(fallback()).toEqual([]);
		});

		it('should return JSON', () => {
			const result = original.getProfiles();

			expect(result).toEqual(json);
		});
	});

	describe('setProfiles', () => {
		it('should write json to profiles file', () => {
			original.setProfiles(allProfiles);

			expect(jsonLib.writeJSON).toBeCalledWith(profilesFile, allProfiles);
		});
	});

	describe('restrictOldFiles', () => {
		it('should throw if any of old files exist', () => {
			existingFiles = [ './input/coubs.json', './input/username1.json' ];

			const func = () => original.restrictOldFiles();

			expect(func).toThrowError('Existing file ./input/coubs.json is not compatible with new multi-profile support, please perform migration (see README.md)');
		});

		it('should not throw if old files not detected', () => {
			existingFiles = [ './secrets/username1.json' ];

			const func = () => original.restrictOldFiles();

			expect(func).not.toThrow();
		});
	});

	describe('create', () => {
		it('should output error and do nothing if profile is falsy', () => {
			const func = () => original.create('');

			expect(func).toThrow('Usage: `npm run create profile` where `profile` - is any profile name you want');
		});

		it('should get profiles', () => {
			const newProfile = 'username1';

			original.create(newProfile);

			expect(profiles.getProfiles).toHaveBeenCalledWith();
		});

		it('should not save profiles if profile already exists', () => {
			const newProfile = 'username1';

			original.create(newProfile);

			expect(profiles.setProfiles).not.toHaveBeenCalled();
		});

		it('should add new profile if not exists', () => {
			const newProfile = 'newProfile';

			original.create(newProfile);

			expect(profiles.setProfiles).toHaveBeenCalledWith([ 'username1', 'username2', 'newProfile' ]);
		});
	});
});
