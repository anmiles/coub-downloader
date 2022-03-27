import Console from '../console';

describe('src/server/lib/console', () => {
	const text = 'text';

	const originalConsole = global.console;
	global.console.log = jest.fn();
	global.console.warn = jest.fn();
	global.console.error = jest.fn();

	afterEach(() => {
		jest.clearAllMocks();
	});
	
	afterAll(() => {
		jest.restoreAllMocks();
		global.console = originalConsole;
	});

	describe('log', () => {
		it('should call console.log with original text', () => {
			new Console().log(text);
			expect(global.console.log).toBeCalledWith(text);
		});

		it('should not call console.log if not enabled', () => {
			new Console(false).log(text);
			expect(global.console.log).not.toBeCalled();
		});
	});

	describe('warn', () => {
		it('should call console.warn with original text', () => {
			new Console().warn(text);
			expect(global.console.warn).toBeCalledWith(text);
		});

		it('should not call console.warn if not enabled', () => {
			new Console(false).warn(text);
			expect(global.console.warn).not.toBeCalled();
		});
	});

	describe('error', () => {
		it('should call console.error with original text', () => {
			new Console().error(text);
			expect(global.console.error).toBeCalledWith(text);
		});

		it('should not call console.error if not enabled', () => {
			new Console(false).error(text);
			expect(global.console.error).not.toBeCalled();
		});
	});
});
