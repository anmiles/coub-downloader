import type { Coub } from '../../types';

import testUtils from '../testUtils';

const id = 'testID';

const override: Partial<Coub> = {
	test : 'value',

	/* eslint-disable camelcase */
	file_versions : {
		html5 : {
			video : {
				high : {
					url  : 'high',
					size : 5,
				},
			},
			audio : {},
		},
	},
	/* eslint-enable camelcase */
};

describe('src/lib/testUtils', () => {
	describe('createTestCoub', () => {
		it('should create test coub given id', () => {
			const testCoub = testUtils.createTestCoub(id);

			expect(testCoub).toMatchSnapshot();
		});

		it('should create test coub given id and override', () => {
			const testCoub = testUtils.createTestCoub(id, override);

			expect(testCoub).toMatchSnapshot();
		});
	});
});
