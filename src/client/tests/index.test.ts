/**
 * @jest-environment jsdom
 */

import { DownloadCoubClient } from '../index';
import { ModalPopup } from '../types/index';

const modalPopup = {
	show: () => modalPopup,
	setContent: jest.fn(),
	popup: {
		close: jest.fn()
	}
};

DownloadCoubClient.prototype.showPopup = () => modalPopup;

const client = new DownloadCoubClient();

const type = 'likes';
const interval = 300;
const totalPages = 3;

let pageID: number;
let coubID: number;

let getJSONSpy: jest.SpyInstance;

function generateCoub(){
	return {id: coubID++};
}

function generateJSON(){
	return {
		page: pageID++,
		total_pages: totalPages,
		coubs: [generateCoub(), generateCoub()],
	};
}

beforeAll(() => {
	getJSONSpy = jest.spyOn(client, 'getJSON');
});

beforeEach(() => {
	pageID = 1;
	coubID = 1;
	getJSONSpy.mockImplementation(generateJSON);
});

describe('src/client/index', () => {

	describe('sleep', () => {
		const sleepMilliseconds = 300;

		afterEach(() => {
			jest.clearAllMocks();
		});

		it('should call setTimeout', async () => {
			const setTimeoutSpy = jest.spyOn(global, 'setTimeout');
			await client.sleep(sleepMilliseconds);
			expect(setTimeoutSpy.mock.calls[0][1]).toBe(sleepMilliseconds);
			setTimeoutSpy.mockRestore();
		});

		it('should wait specified timeout', async () => {
			const before = new Date().getTime(); 
			await client.sleep(sleepMilliseconds);
			const after = new Date().getTime();
			expect(after - before).toBeGreaterThanOrEqual(sleepMilliseconds);
		});
	});

	describe('downloadCoubs', () => {
		let sleepSpy: jest.SpyInstance;
		let setContentSpy: jest.SpyInstance;
		let modalPopup: ModalPopup;

		beforeAll(() => {
			sleepSpy = jest.spyOn(client, 'sleep');
			modalPopup = client.showPopup();
			setContentSpy = jest.spyOn(modalPopup, 'setContent');
		});
		
		afterEach(() => {
			jest.resetAllMocks();
		});
		
		afterAll(() => {
			jest.restoreAllMocks();
		});

		it('should download json', async () => {
			const coubs = [generateCoub(), generateCoub()];

			await client.downloadCoubs(coubs, type, modalPopup, interval);

			expect(getJSONSpy).toBeCalledTimes(totalPages);
			expect(getJSONSpy.mock.calls).toMatchSnapshot();
			expect(getJSONSpy.mock.results).toMatchSnapshot();
		});

		it('should set popup content', async () => {
			const coubs = [generateCoub(), generateCoub()];

			await client.downloadCoubs(coubs, type, modalPopup, interval);

			expect(setContentSpy).toBeCalledTimes(totalPages);
			expect(setContentSpy.mock.calls).toMatchSnapshot();
		});

		it('should sleep on each request', async () => {
			const coubs = [generateCoub(), generateCoub()];

			await client.downloadCoubs(coubs, type, modalPopup, interval);

			expect(sleepSpy).toBeCalledTimes(totalPages);
			expect(sleepSpy.mock.calls).toMatchSnapshot();
		});

		it('should append to coubs', async () => {
			const coubs = [generateCoub(), generateCoub()];

			await client.downloadCoubs(coubs, type, modalPopup, interval);

			expect(coubs).toMatchSnapshot();
		});
	});

	describe('downloadFile', () => {
		const filename = 'filename';
		const text = 'text';

		let clickSpy: jest.SpyInstance;
		let downloadLink: HTMLAnchorElement;
		
		beforeAll(() => {
			clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click');
		});
		
		beforeEach(() => {
			downloadLink = document.createElement('a');

			clickSpy.mockImplementation(function(){
				downloadLink = this;
			});
		});
		
		afterEach(() => {
			jest.resetAllMocks();
		});
		
		afterAll(() => {
			jest.restoreAllMocks();
		});

		it('should create and click download link', () => {
			client.downloadFile(filename, text);
			expect(downloadLink.outerHTML).toBe('<a href="data:text/plain;charset=utf-8,text" download="filename" style="display: none;"></a>');
		});
	});

	describe('execute', () => {
		let downloadCoubsSpy: jest.SpyInstance;
		let downloadFileSpy: jest.SpyInstance;
		let closePopupSpy: jest.SpyInstance;	
		
		beforeAll(() => {
			downloadCoubsSpy = jest.spyOn(client, 'downloadCoubs');
			downloadFileSpy = jest.spyOn(client, 'downloadFile');
			closePopupSpy = jest.spyOn(modalPopup.popup, 'close');
		});
		
		beforeEach(() => {
			downloadCoubsSpy.mockImplementation((coubs) => [...coubs, generateCoub(), generateCoub()]);
		});
		
		afterEach(() => {
			jest.resetAllMocks();
		});
		
		afterAll(() => {
			jest.restoreAllMocks();
		});
		
		it('should download likes and favourites', async () => {
			await client.execute();

			expect(downloadCoubsSpy.mock.calls).toMatchSnapshot();
		});
		
		it('should download JSON file', async () => {
			await client.execute();

			expect(downloadFileSpy.mock.calls).toMatchSnapshot();
		});
		
		it('should close popup', async () => {
			await client.execute();

			expect(closePopupSpy).toBeCalled();
		});
	});
});

