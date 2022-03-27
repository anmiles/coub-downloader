import * as testUtils from '../testUtils';
import type { Coub } from '../../types/coub';

describe('src/server/lib/testUtils', () => {
	describe('createTestCoub', () => {
		it('should create test coub given id', () => {
			const id = 'testID';
			const testCoub = testUtils.createTestCoub(id);
			expect(testCoub).toMatchSnapshot();
		});

		it('should create test coub given id and override', () => {
			const id = 'testID';
			const override: Partial<Coub> = {
				test: 'value',
				file_versions: {
					html5: {
						video: {
							high: {
								url: 'high', 
								size: 5
							}
						}, 
						audio: {}
					}
				}
			};

			const testCoub = testUtils.createTestCoub(id, override);
			
			expect(testCoub).toMatchSnapshot();
		});		
	});
});
