import fs from 'fs';
import path from 'path';
import http from 'http';
import https from 'https';
import Console from './console';
import Renderer from './renderer';
import { sleep } from './sleep';
import type { Coub } from '../types/coub';

export default class Downloader {
	outputPath = '';
	mediaDirname = 'media';
	htmlFilename = 'index.html';
	templatePath = './src/server/templates';
	sleepMilliseconds = 500;

	renderer = new Renderer();
	console = new Console(process.env.NODE_ENV !== 'test');

	async execute(filename: string, outputPath = 'output'): Promise<void> {
		this.outputPath = outputPath;
		this.createDir();
		this.createDir(this.mediaDirname);

		if (!filename) {
			throw `Usage: node ${process.argv[1]} <filename> [<output_path> = "output"]`;
		}

		if (!fs.existsSync(filename)) {
			throw `Filename ${filename} does not exist; current directory is ${path.resolve('.')}`;
		}

		const coubs = JSON.parse(fs.readFileSync(filename).toString()) as Coub[];

		for (const coub of coubs) {
			await this.downloadCoub(coub);
		}

		this.renderer.render(path.join(this.outputPath, this.htmlFilename), this.templatePath, coubs);
	}

	async downloadCoub(coub: Coub): Promise<Coub> {
		this.console.log(`Processing ${coub.permalink}`);

		const videoURL = this.selectBestURL(coub, 'video', true);
		const audioURL = this.selectBestURL(coub, 'audio');

		await this.downloadMedia(coub.permalink, videoURL);
		if (audioURL) await this.downloadMedia(coub.permalink, audioURL);
		await this.downloadMedia(coub.permalink, coub.picture);

		return coub;
	}

	async downloadMedia(id: string, url: string | undefined): Promise<void> {
		if (url === undefined) return;

		const whitelistedHosts = [
			'https://coub-anubis-a.akamaized.net/',
			'https://coub-attachments.akamaized.net/'
		];

		if (whitelistedHosts.filter(host => url.startsWith(host)).length === 0) {
			throw `Media url ${url} is not belong to any of whitelisted hosts ${whitelistedHosts.join(' ')}`;
		}

		const filename = this.createMediaFilename(id, url);

		if (!fs.existsSync(filename)) {
			this.console.log(`\tDownloading ${url}`);
			await sleep(this.sleepMilliseconds);
			await this.downloadFile(url, filename);
		}
	}

	async downloadFile(url: string, filename: string): Promise<fs.WriteStream> {
		return new Promise((resolve, reject) => {
			const protocol = url.startsWith('https') ? https : http;

			protocol.get(url, function(res) {
				if (res.statusCode !== 200) {
					reject(`Request to ${url} returned with status code: ${res.statusCode}`);
					res.resume();
					return;
				}

				const stream = fs.createWriteStream(filename);

				res.on('end', function() {
					resolve(stream);
				});

				res.pipe(stream);
			
			}).on('error', (e) => {
				reject(`Request to ${url} failed with error: ${e.message}`);
			});
		});
	}

	selectBestURL(coub: Coub, key: keyof typeof coub.file_versions.html5, required?: boolean): string | undefined {
		const fileVersions = coub.file_versions?.html5;
		const hasVersions = fileVersions && fileVersions[key] !== undefined && Object.keys(fileVersions[key]).length > 0;
		const bestURL = hasVersions ? Object.values(fileVersions[key]).sort((v1, v2) => v2.size - v1.size)[0].url : undefined;
	
		if (bestURL === undefined && required) {
			throw `There are no file_versions.html5.${key} for coub ${coub.permalink}`;
		}
	
		return bestURL;
	}	

	createDir(...paths: string[]) {
		const dirPath = path.join(this.outputPath, ...paths);
		const exists = fs.existsSync(dirPath);
		if (!exists) fs.mkdirSync(dirPath, { recursive: true });
		return dirPath;
	}

	createMediaFilename(id: string, url: string): string {
		const dirPath = this.createDir(this.mediaDirname, id);
		const ext = url.split('.').pop();
		return path.join(dirPath, `${id}.${ext}`);
	}
}
