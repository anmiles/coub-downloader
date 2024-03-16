import type { CoubsType, CoubsJson } from 'types/coubs';
import type { ModalPopup } from 'types/modalPopup';
import type {} from 'types/window';

// eslint-disable-next-line import/exports-last -- back-compatibility for usage instructions
export class DownloadCoubClient {
	async sleep(milliSeconds: number): Promise<void> {
		return new Promise((resolve) => {
			setTimeout(resolve, milliSeconds);
		});
	}

	/* istanbul ignore next */
	showPopup(): ModalPopup {
		return window.ModalPopup.show({ content : 'Downloading...', classes : 'modal--disabled' });
	}

	/* istanbul ignore next */
	async getJSON(url: string): Promise<CoubsJson> {
		return await window.jQuery.get(url) as CoubsJson;
	}

	async downloadCoubs(coubs: unknown[], type: CoubsType, modalPopup: ModalPopup, interval: number): Promise<void> {
		let totalPages: number;
		let page = 1;

		do {
			const url  = `/api/v2/timeline/${type}?all=true&order_by=date&per_page=25&page=${page}`;
			const json = await this.getJSON(url);

			modalPopup.setContent(`Downloading ${type} (page ${json.page} of ${json.total_pages})...`);
			await this.sleep(interval);

			totalPages = json.total_pages;
			json.coubs.forEach((coub) => coubs.push(coub));
			page++;
		} while (page <= totalPages);
	}

	downloadFile(filename: string, text: string): void {
		const element = document.createElement('a');
		element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`);
		element.setAttribute('download', filename);

		element.style.display = 'none';
		document.body.appendChild(element);

		element.click();

		document.body.removeChild(element);
	}

	async execute(profile: string): Promise<void> {
		const modalPopup       = this.showPopup();
		const interval         = 300;
		const coubs: unknown[] = [];

		await this.downloadCoubs(coubs, 'likes', modalPopup, interval);
		await this.downloadCoubs(coubs, 'favourites', modalPopup, interval);

		this.downloadFile(`${profile}.json`, JSON.stringify(coubs, null, '\t'));

		modalPopup.popup.close();
	}
}

/* istanbul ignore next */
if (window.location.host === 'coub.com') {
	const profile = window.prompt('Choose profile');

	if (profile) {
		void new DownloadCoubClient().execute(profile);
	}
}
