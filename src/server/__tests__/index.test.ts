import Downloader from '../lib/downloader';
jest.mock('../lib/downloader');

describe('src/server/index', () => {
	const filename = 'coubs.json';
	const outputDir = 'output';
	
	it('should execute downloader', async () => {
		const originalArgs = process.argv;
		process.argv = ['node', './index.ts', filename, outputDir];
		const executeSpy = jest.spyOn(Downloader.prototype, 'execute').mockResolvedValue(undefined);

		require('../index');
		expect(executeSpy).toBeCalledWith(filename, outputDir);

		process.argv = originalArgs;
		executeSpy.mockRestore();
	});
});
