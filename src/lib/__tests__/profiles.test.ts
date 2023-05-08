import fs from 'fs';
import paths from '../paths';

import profiles from '../profiles';
const original = jest.requireActual('../profiles').default as typeof profiles;
jest.mock<typeof profiles>('../profiles', () => ({
	getProfiles : jest.fn().mockImplementation(() => existingProfiles),
	setProfiles : jest.fn(),
	create      : jest.fn(),
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

let getJSONSpy: jest.SpyInstance;
let writeJSONSpy: jest.SpyInstance;

beforeAll(() => {
	getJSONSpy   = jest.spyOn(fs, 'getJSON');
	writeJSONSpy = jest.spyOn(fs, 'writeJSON');
});

beforeEach(() => {
	getJSONSpy.mockImplementation(() => json);
	writeJSONSpy.mockImplementation();
});

afterAll(() => {
	getJSONSpy.mockRestore();
	writeJSONSpy.mockRestore();
});

describe('src/lib/profiles', () => {

	describe('getProfiles', () => {
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

			expect(writeJSONSpy).toHaveBeenCalledWith(profilesFile, allProfiles);
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
