import type { ModalPopup, CoubsType, CoubsJson } from './types';

export class DownloadCoubClient {
	sleep(milliSeconds: number) {
		return new Promise((resolve) => {
			setTimeout(resolve, milliSeconds);
		});
	}

	/* istanbul ignore next */
	showPopup() {
		return window.ModalPopup.show({ content : 'Downloading...', classes : 'modal--disabled' });
	}

	/* istanbul ignore next */
	async getJSON(url: string): Promise<CoubsJson> {
		return await jQuery.get(url) as CoubsJson;
	}

	async downloadCoubs(coubs: unknown[], type: CoubsType, modalPopup: ModalPopup, interval: number) {
		let totalPages: number;
		let page = 1;

		do {
			const url  = `/api/v2/timeline/${type}?all=true&order_by=date&per_page=25&page=${page}`;
			const json = await this.getJSON(url) as CoubsJson;

			modalPopup.setContent(`Downloading ${type} (page ${json.page} of ${json.total_pages})...`);
			await this.sleep(interval);

			totalPages = json.total_pages;
			json.coubs.forEach((coub) => coubs.push(coub));
			page++;
		} while (page <= totalPages);
	}

	downloadFile(filename: string, text: string) {
		const element = document.createElement('a');
		element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`);
		element.setAttribute('download', filename);

		element.style.display = 'none';
		document.body.appendChild(element);

		element.click();

		document.body.removeChild(element);
	}

	async execute() {
		const modalPopup       = this.showPopup();
		const interval         = 300;
		const coubs: unknown[] = [];

		await this.downloadCoubs(coubs, 'likes', modalPopup, interval);
		await this.downloadCoubs(coubs, 'favourites', modalPopup, interval);

		this.downloadFile('coubs.json', JSON.stringify(coubs, null, '\t'));

		modalPopup.popup.close();
	}
}

/* istanbul ignore next */
if (window.location.host === 'coub.com') {
	new DownloadCoubClient().execute();
}

