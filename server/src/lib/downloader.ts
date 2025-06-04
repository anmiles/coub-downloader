import fs from 'fs';

import { download } from '@anmiles/downloader';
import { info, log } from '@anmiles/logger';
import '@anmiles/prototypes';
import sleep from '@anmiles/sleep';
import { validate } from '@anmiles/zod-tools';
import { coubSchema } from '@coub-downloader/shared';
import type { Coub, CoubFile } from '@coub-downloader/shared';

import { renderIndex } from './renderer';
import { getCoubsFile, getIndexFile, getMediaDir, getMediaFile } from './utils/paths';

const sleepMilliseconds = 500;

export async function downloadAllCoubs(profile: string): Promise<void> {
	fs.ensureDir(getMediaDir(profile));

	const coubs = readAllCoubs(profile);

	for (const coub of coubs) {
		await downloadCoub(profile, coub);
	}

	const html = renderIndex(coubs);
	fs.writeFileSync(getIndexFile(profile), html);
}

function readAllCoubs(profile: string): Coub[] {
	const coubsFile = getCoubsFile(profile);
	const coubs     = fs.getJSON<unknown[]>(coubsFile, () => {
		throw new Error(`Coubs json ${coubsFile} doesn't exist. Refer to README.md in order to obtain it`);
	});

	return coubs.map((coub) => validate(coub, coubSchema));
}

async function downloadCoub(profile: string, coub: Coub): Promise<Coub> {
	log(`Processing ${coub.permalink}`);

	const videoURL = selectBestURL(coub, 'video');
	const audioURL = selectBestURL(coub, 'audio');

	if (!videoURL) {
		throw new Error(`There are no file_versions.html5.video for coub ${coub.permalink}`);
	}

	await downloadMedia(profile, coub.permalink, videoURL);
	if (audioURL) {
		await downloadMedia(profile, coub.permalink, audioURL);
	}
	await downloadMedia(profile, coub.permalink, coub.picture);

	return coub;
}

async function downloadMedia(profile: string, coubID: string, url: string): Promise<void> {
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

function selectBestURL(coub: Coub, key: keyof typeof coub.file_versions.html5): string | undefined {
	const fileVersions = coub.file_versions.html5;
	const media        = fileVersions[key];
	const hasVersions  = media !== undefined && Object.keys(media).length > 0;
	const bestURL      = hasVersions ? Object.values(media).sort((v1: CoubFile, v2: CoubFile) => v2.size - v1.size)[0]?.url : undefined;
	return bestURL;
}
