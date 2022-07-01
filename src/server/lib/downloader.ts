import fs from 'fs';
import axios from 'axios';
import type { Coub } from '../types';
import { getJSON } from './jsonLib';
import { log, info, error } from './logger';
import { getMediaFile, getCoubsFile, ensureFile } from './paths';
import { render } from './renderer';
import { sleep } from './sleep';

import downloader from './downloader';

const sleepMilliseconds = 500;

export { download };
export default { download, downloadCoub, downloadMedia, downloadFile, selectBestURL };

async function download(profile: string): Promise<void> {
	const coubsFile = getCoubsFile(profile);
	const coubs     = getJSON<Coub[]>(coubsFile, () => error(`Coubs json ${coubsFile} doesn't exist. Refer to README.md in order to obtain it`) as never);

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
	];

	if (whitelistedHosts.filter((host) => url.startsWith(host)).length === 0) {
		throw `Media url ${url} is not belong to any of whitelisted hosts ${whitelistedHosts.join(' ')}`;
	}

	const mediaFile = getMediaFile(profile, coubID, url);

	if (!fs.existsSync(mediaFile)) {
		info(`\tDownloading ${url}`);
		await sleep(sleepMilliseconds);
		await downloader.downloadFile(url, mediaFile);
	}
}

async function downloadFile(url: string, filename: string): Promise<void> {
	const response = await axios({
		url,
		method       : 'GET',
		responseType : 'arraybuffer',
	});

	if (response.status !== 200) {
		throw `Request to ${url} returned with status code: ${response.status}`;
	}

	ensureFile(filename);
	fs.writeFileSync(filename, Buffer.from(response.data));
}

function selectBestURL(coub: Coub, key: keyof typeof coub.file_versions.html5, required?: boolean): string | undefined {
	const fileVersions = coub.file_versions?.html5;
	const hasVersions  = fileVersions && fileVersions[key] !== undefined && Object.keys(fileVersions[key]).length > 0;
	const bestURL      = hasVersions ? Object.values(fileVersions[key]).sort((v1, v2) => v2.size - v1.size)[0].url : undefined;

	if (bestURL === undefined && required) {
		throw `There are no file_versions.html5.${key} for coub ${coub.permalink}`;
	}

	return bestURL;
}
