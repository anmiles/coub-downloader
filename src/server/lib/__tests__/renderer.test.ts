import fs from 'fs';
import path from 'path';
import Renderer from '../renderer';
import { createTestCoub } from '../testUtils';
import type { CoubFile } from '../../types/coub';

jest.mock('fs');
jest.mock('path');

const renderer = new Renderer();

describe('src/server/lib/renderer', () => {
	const htmlFilename = 'htmlFilename';
	const templatePath = 'templatePath';
	const templates = {'template1': 'html1', 'template2': 'html2'};
	const coub1 = createTestCoub('coub1');
	const coub2 = createTestCoub('coub2');
	const coubs = [coub1, coub2];
	const unescapedString = '<a href="url">text &lt;</a>';
	const escapedString = '<a href="url">text &lt;</a>';

	describe('render', () => {
		beforeAll(() => {
			jest.spyOn(renderer, 'getTemplates').mockReturnValue(templates);
			jest.spyOn(renderer, 'formatCoub').mockImplementation((coub) => `${coub.permalink}_formatted`);
			jest.spyOn(renderer, 'format').mockImplementation(rootTemplate => `${rootTemplate}_formatted`);
		});

		afterEach(() => {
			jest.clearAllMocks();
		});
		
		afterAll(() => {
			jest.restoreAllMocks();
		});
		
		it('should get templates by templatePath', () => {
			renderer.render(htmlFilename, templatePath, coubs);
			expect(renderer.getTemplates).toBeCalledWith(templatePath);
		});

		it('should format each coub', () => {
			renderer.render(htmlFilename, templatePath, coubs);
			expect(renderer.formatCoub).toBeCalledWith(coub1, templates);
			expect(renderer.formatCoub).toBeCalledWith(coub2, templates);
		});

		it('should format index template using concatenated coubs', () => {
			renderer.render(htmlFilename, templatePath, coubs);
			expect(renderer.format).toBeCalledWith('index', {coubs: 'coub1_formatted\ncoub2_formatted'}, templates);
		});

		it('should output formatted index template to html file', () => {
			renderer.render(htmlFilename, templatePath, coubs);
			expect(fs.writeFileSync).toBeCalledWith(htmlFilename, 'index_formatted');
		});
	});

	describe('getTemplates', () => {
		beforeAll(() => {
			jest.spyOn(fs, 'readdirSync').mockReturnValue(Object.keys(templates) as unknown as fs.Dirent[]);
			jest.spyOn(fs, 'readFileSync').mockImplementation(filename => `{${filename}}`);
			jest.spyOn(path, 'join').mockImplementation((...paths) => paths.join('/'));
		});

		afterEach(() => {
			jest.clearAllMocks();
		});
		
		afterAll(() => {
			jest.restoreAllMocks();
		});
		
		it('should read template directory', () => {
			renderer.getTemplates(templatePath);
			expect(fs.readdirSync).toBeCalledWith(templatePath);
		});

		it('should read each template', () => {
			renderer.getTemplates(templatePath);
			expect(fs.readFileSync).toBeCalledWith('templatePath/template1');
			expect(fs.readFileSync).toBeCalledWith('templatePath/template2');
		});

		it('should return indexed templates collection', () => {
			const result = renderer.getTemplates(templatePath);
			expect(result).toEqual({template1: '{templatePath/template1}', template2: '{templatePath/template2}'});
		});
	});

	describe('formatCoub', () => {
		beforeAll(() => {
			jest.spyOn(renderer, 'format').mockImplementation(rootTemplate => `${rootTemplate}_formatted`);
			jest.spyOn(path, 'join').mockImplementation((...paths) => paths.join('/'));
		});

		afterEach(() => {
			jest.clearAllMocks();
		});
	
		afterAll(() => {
			jest.restoreAllMocks();
		});

		it('should throw if coub.permalink is not alphanumeric string', () => {
			const coub = createTestCoub('i%va!id');

			expect(() => renderer.formatCoub(coub, templates)).toThrowError('coub ID is not alphanumeric string and might be unsafe: i%va!id');
		});
	
		it('should escape coub.title', () => {
			const coub = createTestCoub('coub1', {title: unescapedString});

			renderer.formatCoub(coub, templates);

			coub.title = escapedString;
			expect(renderer.format).toBeCalledWith('coub', coub, templates);
		});
	
		it('should set coub.audio to blank space if audio does not exist', () => {
			const coub = createTestCoub('coub1', {
				file_versions: {
					html5: {
						audio: undefined as unknown as Record<string, CoubFile>, 
						video: {}
					}
				}
			});

			renderer.formatCoub(coub, templates);

			coub.audio = '&nbsp;';
			expect(renderer.format).toBeCalledWith('coub', coub, templates);
		});

		it('should set coub.audio to blank space if there is no audio', () => {
			const coub = createTestCoub('coub1', {
				file_versions: {
					html5: {
						audio: {},
						video: {}
					}
				}
			});

			renderer.formatCoub(coub, templates);

			coub.audio = '&nbsp;';
			expect(renderer.format).toBeCalledWith('coub', coub, templates);
		});

		it('should not set coub.audio if audio exists', () => {
			const coub = createTestCoub('coub1', {
				file_versions: {
					html5: {
						audio: {
							big: {
								size: 10,
								url: 'URL'
							}
						}, 
						video: {}
					}
				}
			});

			renderer.formatCoub(coub, templates);

			expect(renderer.format).toBeCalledWith('coub', coub, templates);
		});

		it('should set coub.externals to blank space if there is no external videos', () => {
			const coub = createTestCoub('coub1', {
				file_versions: {
					html5: {
						audio: {},
						video: {}
					}
				}
			});

			renderer.formatCoub(coub, templates);

			coub.externals = '&nbsp;';
			expect(renderer.format).toBeCalledWith('coub', coub, templates);
		});

		it('should set coub.externals to formatted externals if there are external videos', () => {
			const coub = createTestCoub('coub1', {
				media_blocks: {
					external_raw_videos: [
						{title: 'title1', url: 'url1', meta: {service: 'service1'}},
						{title: 'title2', url: 'url2', meta: {service: 'service2'}}
					]
				}
			});

			renderer.formatCoub(coub, templates);

			coub.externals = 'external_formatted\nexternal_formatted';
			expect(renderer.format).toBeCalledWith('coub', coub, templates);
		});

		it('should throw if any of coub.externals have a service.name that is not alphanumeric string', () => {
			const coub = createTestCoub('coub1', {
				media_blocks: {
					external_raw_videos: [
						{title: 'title1', url: 'url1', meta: {service: 'service1'}},
						{title: 'title2', url: 'url2', meta: {service: 'i%va!id'}}
					]
				}
			});

			expect(() => renderer.formatCoub(coub, templates)).toThrowError('service name of external video is not alphanumeric string and might be unsafe: i%va!id');
		});
	
		it('should escape coub.externals.*.title', () => {
			const coub = createTestCoub('coub1', {
				media_blocks: {
					external_raw_videos: [
						{title: unescapedString, url: 'url1', meta: {service: 'service1'}},
					]
				}
			});

			renderer.formatCoub(coub, templates);

			coub.media_blocks.external_raw_videos[0].title = escapedString;
			expect(renderer.format).toBeCalledWith('coub', coub, templates);
		});

		it('should throw if coub.likes_count is not a number', () => {
			const coub = createTestCoub('coub1', {
				likes_count: 'not_a_number' as unknown as number,
			});

			expect(() => renderer.formatCoub(coub, templates)).toThrowError('coub.likes_count is not_a_number that is not a number');
		});

		it('should throw if coub.views_count is not a number', () => {
			const coub = createTestCoub('coub1', {
				views_count: 'not_a_number' as unknown as number,
			});

			expect(() => renderer.formatCoub(coub, templates)).toThrowError('coub.views_count is not_a_number that is not a number');
		});

		it('should format each external block', () => {
			const coub = createTestCoub('coub1', {
				media_blocks: {
					external_raw_videos: [
						{title: 'title1', url: 'url1', meta: {service: 'service1'}},
						{title: 'title2', url: 'url2', meta: {service: 'service2'}}
					]
				}
			});

			renderer.formatCoub(coub, templates);
			expect(renderer.format).toBeCalledWith('external', coub.media_blocks.external_raw_videos[0], templates);
			expect(renderer.format).toBeCalledWith('external', coub.media_blocks.external_raw_videos[1], templates);
		});
	
		it('should return formatted coub', () => {
			const coub = createTestCoub('coub1');
			const result = renderer.formatCoub(coub, templates);
			expect(result).toBe('coub_formatted');
		});
	});

	describe('preventUnsafeString', () => {
		it('should throw if argument is not a string', () => {
			const notAString = 5;
			const error = 'invalidString is not string but number and might be unsafe: 5';

			expect(() => renderer.preventUnsafeString(notAString as unknown as string, 'invalidString')).toThrowError(error);
		});

		it('should throw if argument is not alphanumeric string', () => {
			const invalidString = 'i#va!id';
			const error = 'invalidString is not alphanumeric string and might be unsafe: i#va!id';

			expect(() => renderer.preventUnsafeString(invalidString, 'invalidString')).toThrowError(error);
		});

		it('should not throw if argument is alphanumeric string', () => {
			const invalidString = 'valid5string';
			expect(() => renderer.preventUnsafeString(invalidString, 'invalidString')).not.toThrow();
		});
	});

	describe('escapeString', () => {
		it('should escape html-sensitive characters', () => {
			const escapedString = renderer.escapeString(unescapedString);
			expect(escapedString).toBe(escapedString);
		});
	});

	describe('format', () => {
		it('should find key in json properties and substitute by value', () => {
			const rootTemplate = 'root';
			const templates = {root: 'value is {{val}}'};
			const json = {val: 10};

			const result = renderer.format(rootTemplate, json, templates);

			expect(result).toBe('value is 10');
		});

		it('should find key in template names and substitute by template', () => {
			const rootTemplate = 'root';
			const templates = {root: 'body: {{body}}', body: 'coubs'};
			const json = {};

			const result = renderer.format(rootTemplate, json, templates);

			expect(result).toBe('body: coubs');
		});

		it('should prefer json properties rather than template names', () => {
			const rootTemplate = 'root';
			const templates = {root: 'value is {{val}}', val: '5'};
			const json = {val: 10};

			const result = renderer.format(rootTemplate, json, templates);

			expect(result).toBe('value is 10');
		});

		it('should recursively substitute', () => {
			const rootTemplate = 'root';
			const templates = {root: 'body: {{body}}', body: 'value is {{val}}'};
			const json = {val: 10};

			const result = renderer.format(rootTemplate, json, templates);

			expect(result).toBe('body: value is 10');
		});

		it('should process nested keys', () => {
			const rootTemplate = 'root';
			const templates = {root: 'body: {{body}}', body: 'value is {{val.current}}'};
			const json = {val: { current: 10}};

			const result = renderer.format(rootTemplate, json, templates);

			expect(result).toBe('body: value is 10');
		});
	});
});
