/**
 * @jest-environment jsdom
 */

import type { Coub, CoubsJson, ModalPopup } from '@coub-downloader/shared';

import { DownloadCoubClient } from '../index';

const modalPopup = {
	show      : () => modalPopup,
	setContent: jest.fn(),
	popup     : {
		close: jest.fn(),
	},
};

DownloadCoubClient.prototype.showPopup = () => modalPopup;

const client = new DownloadCoubClient();

const type       = 'likes';
const interval   = 300;
const totalPages = 3;
const profile    = 'username';

let pageID: number;
let coubID: number;

const getJSONSpy = jest.spyOn(client, 'getJSON');

function generateCoub(): Partial<Coub> {
	return { id: coubID++ };
}

function generateJSON(): CoubsJson {
	return {
		page       : pageID++,
		total_pages: totalPages,
		coubs      : [
			generateCoub(),
			generateCoub(),
		],
	};
}

beforeEach(() => {
	pageID = 1;
	coubID = 1;
	// eslint-disable-next-line @typescript-eslint/require-await -- allow to mock with sync function
	getJSONSpy.mockImplementation(async () => generateJSON());
});

describe('src/client/index', () => {
	describe('downloadCoubs', () => {
		let sleepSpy: jest.SpyInstance;
		let setContentSpy: jest.SpyInstance;
		let modalPopup: ModalPopup;

		beforeAll(() => {
			sleepSpy      = jest.spyOn(client, 'sleep');
			modalPopup    = client.showPopup();
			setContentSpy = jest.spyOn(modalPopup, 'setContent');
		});

		it('should download json', async () => {
			const coubs = [ generateCoub(), generateCoub() ];

			await client.downloadCoubs(coubs, type, modalPopup, interval);

			expect(getJSONSpy).toHaveBeenCalledTimes(totalPages);
			expect(getJSONSpy.mock.calls).toMatchSnapshot();
		});

		it('should set popup content', async () => {
			const coubs = [ generateCoub(), generateCoub() ];

			await client.downloadCoubs(coubs, type, modalPopup, interval);

			expect(setContentSpy).toHaveBeenCalledTimes(totalPages);
			expect(setContentSpy.mock.calls).toMatchSnapshot();
		});

		it('should sleep on each request', async () => {
			const coubs = [ generateCoub(), generateCoub() ];

			await client.downloadCoubs(coubs, type, modalPopup, interval);

			expect(sleepSpy).toHaveBeenCalledTimes(totalPages);
			expect(sleepSpy.mock.calls).toMatchSnapshot();
		});

		it('should append to coubs', async () => {
			const coubs = [ generateCoub(), generateCoub() ];

			await client.downloadCoubs(coubs, type, modalPopup, interval);

			expect(coubs).toMatchSnapshot();
		});
	});

	describe('downloadFile', () => {
		const filename = 'filename';
		const text     = 'text';

		let downloadLink: HTMLAnchorElement;

		((originalClick) => {

			beforeAll(() => {
				downloadLink = document.createElement('a');

				HTMLAnchorElement.prototype.click = function() {

					downloadLink = this;
				};
			});

			afterAll(() => {
				HTMLAnchorElement.prototype.click = originalClick;
			});

		// eslint-disable-next-line @typescript-eslint/unbound-method
		})(HTMLAnchorElement.prototype.click);

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
			downloadFileSpy  = jest.spyOn(client, 'downloadFile');
			closePopupSpy    = jest.spyOn(modalPopup.popup, 'close');
		});

		beforeEach(() => {
			downloadCoubsSpy.mockImplementation((coubs: unknown[]) => [ ...coubs, generateCoub(), generateCoub() ]);
		});

		it('should download likes and favourites', async () => {
			await client.execute(profile);

			expect(downloadCoubsSpy.mock.calls).toMatchSnapshot();
		});

		it('should download JSON file', async () => {
			await client.execute(profile);

			expect(downloadFileSpy.mock.calls).toMatchSnapshot();
		});

		it('should close popup', async () => {
			await client.execute(profile);

			expect(closePopupSpy).toHaveBeenCalled();
		});
	});
});

