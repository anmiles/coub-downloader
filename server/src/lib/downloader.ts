import fs from 'fs';
import '@anmiles/prototypes';
import { download } from '@anmiles/downloader';
import { log, info } from '@anmiles/logger';
import sleep from '@anmiles/sleep';
import type { Coub, CoubFile } from 'types/coub';
import { getMediaFile, getCoubsFile } from './paths';
import { render } from './renderer';

import downloader from './downloader';

const sleepMilliseconds = 500;

async function downloadAll(profile: string): Promise<void> {
	const coubsFile = getCoubsFile(profile);
	const coubs     = fs.getJSON<Coub[]>(coubsFile, () => {
		throw new Error(`Coubs json ${coubsFile} doesn't exist. Refer to README.md in order to obtain it`);
	});

	for (const coub of coubs) {
		await downloader.downloadCoub(profile, coub);
	}

	render(profile, coubs);
}

async function downloadCoub(profile: string, coub: Coub): Promise<Coub> {
	log(`Processing ${coub.permalink}`);

	const videoURL = downloader.selectBestURL(coub, 'video', true);
	const audioURL = downloader.selectBestURL(coub, 'audio');

	await downloader.downloadMedia(profile, coub.permalink, videoURL);
	if (audioURL) {
		await downloader.downloadMedia(profile, coub.permalink, audioURL);
	}
	await downloader.downloadMedia(profile, coub.permalink, coub.picture);

	return coub;
}

async function downloadMedia(profile: string, coubID: string, url: string | undefined): Promise<void> {
	if (url === undefined) {
		return;
	}

	const whitelistedHosts = [
		'https://coub-anubis-a.akamaized.net/',
		'https://coub-attachments.akamaized.net/',
		'https://3fc4ed44-3fbc-419a-97a1-a29742511391.selcdn.net/',
	];

	if (whitelistedHosts.filter((host) => url.startsWith(host)).length === 0) {
		throw new Error(`Media url ${url} is not belong to any of whitelisted hosts ${whitelistedHosts.join(' ')}`);
	}

	const mediaFile = getMediaFile(profile, coubID, url);

	if (!fs.existsSync(mediaFile)) {
		info(`\tDownloading ${url}`);
		await sleep(sleepMilliseconds);
		await download(url, mediaFile);
	}
}

function selectBestURL(coub: Coub, key: keyof typeof coub.file_versions.html5, required?: boolean): string | undefined {
	const fileVersions = coub.file_versions.html5;
	const media        = fileVersions[key];
	const hasVersions  = media !== undefined && Object.keys(media).length > 0;
	const bestURL      = hasVersions ? Object.values(media).sort((v1: CoubFile, v2: CoubFile) => v2.size - v1.size)[0]?.url : undefined;

	if (bestURL === undefined && required) {
		throw new Error(`There are no file_versions.html5.${key} for coub ${coub.permalink}`);
	}

	return bestURL;
}

export { downloadAll };
export default { downloadAll, downloadCoub, downloadMedia, selectBestURL };
