/* eslint-disable camelcase */
import fs from 'fs';
import path from 'path';
import paths from '../paths';
import { createTestCoub } from '../testUtils';
import type { CoubFile } from '../../types';

import renderer from '../renderer';
const original = jest.requireActual('../renderer').default as typeof renderer;
jest.mock<typeof renderer>('../renderer', () => ({
	render              : jest.fn(),
	getTemplates        : jest.fn().mockImplementation(() => templates),
	formatCoub          : jest.fn().mockImplementation((coub) => `${coub.permalink}_formatted`),
	preventUnsafeString : jest.fn(),
	escapeString        : jest.fn(),
	format              : jest.fn().mockImplementation((rootTemplate) => `${rootTemplate}_formatted`),
}));

jest.mock<Partial<typeof fs>>('fs', () => ({
	writeFileSync : jest.fn(),
	readdirSync   : jest.fn().mockImplementation(() => Object.keys(templates)),
	readFileSync  : jest.fn().mockImplementation((filename) => `{${filename}}`),
}));

jest.mock<Partial<typeof path>>('path', () => ({
	join : jest.fn().mockImplementation((...paths) => paths.join('/')),
}));

jest.mock<Partial<typeof paths>>('../paths', () => ({
	getIndexFile   : jest.fn().mockImplementation(() => indexFile),
	getTemplateDir : jest.fn().mockImplementation(() => templateDir),
}));

const profile         = 'username';
const indexFile       = 'indexFile';
const templateDir     = 'templateDir';
const templates       = { template1 : 'html1', template2 : 'html2' };
const coub1           = createTestCoub('coub1');
const coub2           = createTestCoub('coub2');
const coubs           = [ coub1, coub2 ];
const unescapedString = '<a href="url">text &lt;</a>';
const escapedString   = '<a href="url">text &lt;</a>';

describe('src/server/lib/renderer', () => {
	describe('render', () => {
		it('should get templates', () => {
			original.render(profile, coubs);

			expect(renderer.getTemplates).toBeCalledWith();
		});

		it('should format each coub', () => {
			original.render(profile, coubs);

			expect(renderer.formatCoub).toBeCalledWith(coub1, templates);
			expect(renderer.formatCoub).toBeCalledWith(coub2, templates);
		});

		it('should format index template using concatenated coubs', () => {
			original.render(profile, coubs);

			expect(renderer.format).toBeCalledWith('index', { coubs : 'coub1_formatted\ncoub2_formatted' }, templates);
		});

		it('should output formatted index template to html file', () => {
			original.render(profile, coubs);

			expect(fs.writeFileSync).toBeCalledWith(indexFile, 'index_formatted');
		});
	});

	describe('getTemplates', () => {
		it('should get template directory', () => {
			original.getTemplates();

			expect(paths.getTemplateDir).toBeCalledWith();
		});

		it('should read template directory', () => {
			original.getTemplates();

			expect(fs.readdirSync).toBeCalledWith(templateDir);
		});

		it('should read each template', () => {
			original.getTemplates();

			expect(fs.readFileSync).toBeCalledWith('templateDir/template1');
			expect(fs.readFileSync).toBeCalledWith('templateDir/template2');
		});

		it('should return indexed templates collection', () => {
			const result = original.getTemplates();

			expect(result).toEqual({ template1 : '{templateDir/template1}', template2 : '{templateDir/template2}' });
		});
	});

	describe('formatCoub', () => {
		it('should check coub.permalink to be a safe string', () => {
			const invalidID = 'i%va!id';
			const coub      = createTestCoub(invalidID);

			original.formatCoub(coub, templates);

			expect(renderer.preventUnsafeString).toBeCalledWith(invalidID, 'coub ID');
		});

		it('should escape coub.title', () => {
			const coub = createTestCoub('coub1', { title : unescapedString });

			original.formatCoub(coub, templates);

			coub.title = escapedString;
			expect(renderer.format).toBeCalledWith('coub', coub, templates);
		});

		it('should set coub.audio to blank space if audio does not exist', () => {
			const coub = createTestCoub('coub1', {
				file_versions : {
					html5 : {
						audio : undefined as unknown as Record<string, CoubFile>,
						video : {},
					},
				},
			});

			original.formatCoub(coub, templates);

			coub.audio = '&nbsp;';
			expect(renderer.format).toBeCalledWith('coub', coub, templates);
		});

		it('should set coub.audio to blank space if there is no audio', () => {
			const coub = createTestCoub('coub1', {
				file_versions : {
					html5 : {
						audio : {},
						video : {},
					},
				},
			});

			original.formatCoub(coub, templates);

			coub.audio = '&nbsp;';
			expect(renderer.format).toBeCalledWith('coub', coub, templates);
		});

		it('should not set coub.audio if audio exists', () => {
			const coub = createTestCoub('coub1', {
				file_versions : {
					html5 : {
						audio : {
							big : {
								size : 10,
								url  : 'URL',
							},
						},
						video : {},
					},
				},
			});

			original.formatCoub(coub, templates);

			expect(renderer.format).toBeCalledWith('coub', coub, templates);
		});

		it('should set coub.externals to blank space if there is no external videos', () => {
			const coub = createTestCoub('coub1', {
				file_versions : {
					html5 : {
						audio : {},
						video : {},
					},
				},
			});

			original.formatCoub(coub, templates);

			coub.externals = '&nbsp;';
			expect(renderer.format).toBeCalledWith('coub', coub, templates);
		});

		it('should set coub.externals to formatted externals if there are external videos', () => {
			const coub = createTestCoub('coub1', {
				media_blocks : {
					external_raw_videos : [
						{ title : 'title1', url : 'url1', meta : { service : 'service1' } },
						{ title : 'title2', url : 'url2', meta : { service : 'service2' } },
					],
				},
			});

			original.formatCoub(coub, templates);

			coub.externals = 'external_formatted\nexternal_formatted';
			expect(renderer.format).toBeCalledWith('coub', coub, templates);
		});

		it('should check each of coub.externals to be a safe string', () => {
			const video1 = { title : 'title1', url : 'url1', meta : { service : 'service1' } };
			const video2 = { title : 'title2', url : 'url2', meta : { service : 'i%va!id' } };

			const coub = createTestCoub('coub1', {
				media_blocks : {
					external_raw_videos : [ video1, video2 ],
				},
			});

			original.formatCoub(coub, templates);

			expect(renderer.preventUnsafeString).toBeCalledWith('service1', 'service name of external video');
			expect(renderer.preventUnsafeString).toBeCalledWith('i%va!id', 'service name of external video');
		});

		it('should escape coub.externals.*.title', () => {
			const coub = createTestCoub('coub1', {
				media_blocks : {
					external_raw_videos : [
						{ title : unescapedString, url : 'url1', meta : { service : 'service1' } },
					],
				},
			});

			original.formatCoub(coub, templates);

			coub.media_blocks.external_raw_videos[0].title = escapedString;
			expect(renderer.format).toBeCalledWith('coub', coub, templates);
		});

		it('should throw if coub.likes_count is not a number', () => {
			const coub = createTestCoub('coub1', {
				likes_count : 'not_a_number' as unknown as number,
			});

			const func = () => original.formatCoub(coub, templates);

			expect(func).toThrowError('coub.likes_count is not_a_number that is not a number');
		});

		it('should throw if coub.views_count is not a number', () => {
			const coub = createTestCoub('coub1', {
				views_count : 'not_a_number' as unknown as number,
			});

			const func = () => original.formatCoub(coub, templates);

			expect(func).toThrowError('coub.views_count is not_a_number that is not a number');
		});

		it('should format each external block', () => {
			const coub = createTestCoub('coub1', {
				media_blocks : {
					external_raw_videos : [
						{ title : 'title1', url : 'url1', meta : { service : 'service1' } },
						{ title : 'title2', url : 'url2', meta : { service : 'service2' } },
					],
				},
			});

			original.formatCoub(coub, templates);

			expect(renderer.format).toBeCalledWith('external', coub.media_blocks.external_raw_videos[0], templates);
			expect(renderer.format).toBeCalledWith('external', coub.media_blocks.external_raw_videos[1], templates);
		});

		it('should return formatted coub', () => {
			const coub = createTestCoub('coub1');

			const result = original.formatCoub(coub, templates);

			expect(result).toBe('coub_formatted');
		});
	});

	describe('preventUnsafeString', () => {
		it('should throw if argument is not a string', () => {
			const notAString = 5;
			const error      = 'invalidString is not string but number and might be unsafe: 5';

			const func = () => original.preventUnsafeString(notAString as unknown as string, 'invalidString');

			expect(func).toThrowError(error);
		});

		it('should throw if argument is not alphanumeric string', () => {
			const invalidString = 'i#va!id';
			const error         = 'invalidString is not alphanumeric string and might be unsafe: i#va!id';

			const func = () => original.preventUnsafeString(invalidString, 'invalidString');

			expect(func).toThrowError(error);
		});

		it('should not throw if argument is alphanumeric string', () => {
			const invalidString = 'valid5string';

			const func = () => original.preventUnsafeString(invalidString, 'invalidString');

			expect(func).not.toThrow();
		});
	});

	describe('escapeString', () => {
		it('should escape html-sensitive characters', () => {
			const escapedString = original.escapeString(unescapedString);

			expect(escapedString).toBe(escapedString);
		});
	});

	describe('format', () => {
		it('should find key in json properties and substitute by value', () => {
			const rootTemplate = 'root';
			const templates    = { root : 'value is {{val}}' };
			const json         = { val : 10 };

			const result = original.format(rootTemplate, json, templates);

			expect(result).toBe('value is 10');
		});

		it('should find key in template names and substitute by template', () => {
			const rootTemplate = 'root';
			const templates    = { root : 'body: {{body}}', body : 'coubs' };
			const json         = {};

			const result = original.format(rootTemplate, json, templates);

			expect(result).toBe('body: coubs');
		});

		it('should prefer json properties rather than template names', () => {
			const rootTemplate = 'root';
			const templates    = { root : 'value is {{val}}', val : '5' };
			const json         = { val : 10 };

			const result = original.format(rootTemplate, json, templates);

			expect(result).toBe('value is 10');
		});

		it('should recursively substitute', () => {
			const rootTemplate = 'root';
			const templates    = { root : 'body: {{body}}', body : 'value is {{val}}' };
			const json         = { val : 10 };

			const result = original.format(rootTemplate, json, templates);

			expect(result).toBe('body: value is 10');
		});

		it('should process nested keys', () => {
			const rootTemplate = 'root';
			const templates    = { root : 'body: {{body}}', body : 'value is {{val.current}}' };
			const json         = { val : { current : 10 } };

			const result = original.format(rootTemplate, json, templates);

			expect(result).toBe('body: value is 10');
		});
	});
});
