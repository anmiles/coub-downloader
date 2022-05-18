import { sleep } from '../sleep';

describe('src/server/lib/sleep', () => {
	describe('sleep', () => {
		const sleepMilliseconds = 300;

		afterEach(() => {
			jest.clearAllMocks();
		});

		it('should call setTimeout', async () => {
			const setTimeoutSpy = jest.spyOn(global, 'setTimeout');
			await sleep(sleepMilliseconds);
			expect(setTimeoutSpy.mock.calls[0][1]).toBe(sleepMilliseconds);
			setTimeoutSpy.mockRestore();
		});

		it('should wait specified timeout', async () => {
			const before = new Date().getTime(); 
			await sleep(sleepMilliseconds);
			const after = new Date().getTime();
			expect(after - before).toBeGreaterThanOrEqual(sleepMilliseconds);
		});
	});
});

