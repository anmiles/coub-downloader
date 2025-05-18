import { renderIndex } from '../renderer';

import { createTestCoub } from './utils/testUtils';

const internalCoub = createTestCoub('internalCoub');

const externalCoub = createTestCoub('externalCoub', {
	media_blocks: {
		external_raw_videos: [
			{ title: 'title1', url: 'url1', meta: { service: 'service1' } },
			{ title: 'title2', url: 'url2', meta: { service: 'service2' } },
		],
	},
});

const audioCoub = createTestCoub('audioCoub', {
	file_versions: {
		html5: {
			audio: {
				big: {
					size: 10,
					url : 'URL',
				},
			},
			video: {},
		},
	},
});

const coubs = [ internalCoub, externalCoub, audioCoub ];

describe('src/lib/renderer', () => {
	describe('renderIndex', () => {
		it('should return index page', () => {
			const result = renderIndex(coubs);

			expect(result).toMatchSnapshot();
		});

		it('should throw error if property missing', () => {
			const untitledCoub = createTestCoub('untitledCoub', { title: undefined });

			const func = (): string => renderIndex([ ...coubs, untitledCoub ]);

			expect(func).toThrow('Missing required value \'title\' while rendering template \'coub\'');
		});

		it('should throw error if string property is actually not a string', () => {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
			const numericCoub = createTestCoub('numericCoub', { permalink: 10 as unknown as string });

			const func = (): string => renderIndex([ ...coubs, numericCoub ]);

			expect(func).toThrow('Coub ID is not string but number and might be unsafe: 10');
		});

		it('should throw error if string property contains non-alphanumeric characters', () => {
			const hyphenCoub = createTestCoub('coub3', { permalink: 'a-b' });

			const func = (): string => renderIndex([ ...coubs, hyphenCoub ]);

			expect(func).toThrow('Coub ID is not alphanumeric string and might be unsafe: a-b');
		});
	});
});
