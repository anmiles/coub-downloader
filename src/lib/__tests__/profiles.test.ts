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
	error : jest.fn().mockImplementation(() => {
		throw mockError;
	}),
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

const mockError = 'mockError';

let existingFiles: string[] = [];

beforeEach(() => {
	existingFiles = [];
});

describe('src/lib/profiles', () => {

	describe('getProfiles', () => {
		const getJSONSpy = jest.spyOn(jsonLib, 'getJSON');

		it('should get json from profiles file', () => {
			original.getProfiles();

			expect(getJSONSpy).toBeCalled();
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

			expect(func).toThrowError(mockError);
			expect(logger.error).toBeCalledWith('Usage: `npm run create profile` where `profile` - is any profile name you want');
		});

		it('should get profiles', () => {
			const newProfile = 'username1';

			original.create(newProfile);

			expect(profiles.getProfiles).toBeCalledWith();
		});

		it('should not save profiles if profile already exists', () => {
			const newProfile = 'username1';

			original.create(newProfile);

			expect(profiles.setProfiles).not.toBeCalled();
		});

		it('should add new profile if not exists', () => {
			const newProfile = 'newProfile';

			original.create(newProfile);

			expect(profiles.setProfiles).toBeCalledWith([ 'username1', 'username2', 'newProfile' ]);
		});
	});

	describe('migrate', () => {
		const migratingProfile = 'username3';

		it('should output error if profile is falsy', () => {
			const func = () => original.migrate('');

			expect(func).toThrowError(mockError);
			expect(logger.error).toBeCalledWith('Usage: `npm run migrate profile` where `profile` - is any profile name you want');
		});

		it('should output error if nothing to migrate', () => {
			existingFiles = [ 'test.json' ];
			const func    = () => original.migrate(migratingProfile);

			expect(func).toThrowError(mockError);
			expect(logger.error).toBeCalledWith('There are no files to migrate');
		});

		describe('there are files to migrate', () => {
			const func = () => original.migrate(migratingProfile);

			beforeEach(() => {
				existingFiles = [ './input/coubs.json', 'test.json' ];
			});

			it('should create profile', () => {
				func();
				expect(profiles.create).toBeCalledWith(migratingProfile);
			});

			it('should rename existing old files', () => {
				func();

				expect(fs.renameSync).toBeCalledWith('./input/coubs.json', './input/username3.json');
			});

			it('should not overwrite existing new files', () => {
				existingFiles.push('./input/username3.json');

				func();

				expect(fs.renameSync).not.toBeCalled();
			});

			it('should output progress', () => {
				func();

				expect(logger.log).toBeCalledWith('Moving \'./input/coubs.json\' to \'./input/username3.json\'...');
			});

			it('should warn about manual action', () => {
				func();

				expect(logger.warn).toBeCalledWith('Please move \'./output/\' to \'./output/username3/\' manually');
			});
		});
	});
});