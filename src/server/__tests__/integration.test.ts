import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { spawn } from 'child_process';

jest.setTimeout(3600000);

async function asyncSpawn(command: Parameters<typeof spawn>[0], args: Parameters<typeof spawn>[1], options: Parameters<typeof spawn>[2]): Promise<number> {
	return new Promise((resolve, reject) => {
		const spawned = spawn(command, args, options);

		spawned.stdout?.on('data', function (data) {
			console.log(data.toString());
		});
		
		spawned.stderr?.on('data', function (data) {
			console.error(data.toString());
		});

		spawned.on('error', reject);
		spawned.on('exit', resolve);
	});
}

function checkFileHash(filename: string) {
	const fileBuffer = fs.readFileSync(filename);
	const hashSum = crypto.createHash('sha256');
	hashSum.update(fileBuffer);

	return {
		filename,
		hash: hashSum.digest('hex')
	};
}

describe('src/server/integration', () => {
	// Launching `npm run build:server` is needed for getting this test passed
	const baseDir = 'src/server/__tests__';
	if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir);

	const filename = `${baseDir}/coubs.json`;
	const outputDir = `${baseDir}/output`;
	const mediaDir = `${outputDir}/media`;

	it('should work', async () => {
		const cwd = path.resolve(path.join(__dirname, '../../..'));
		const script = 'dist/server/index.js';
		const scriptPath = path.resolve(path.join(cwd, script));

		if (!fs.existsSync(scriptPath)) {
			throw `Compiled script ${scriptPath} does not exist. Execute 'npm run build:server' first`;
		}

		const exitCode = await asyncSpawn('node', [script, filename, outputDir], { cwd });

		expect(exitCode).toBe(0);

		const coubIDs = fs.readdirSync(mediaDir);
		expect(coubIDs).toEqual(['test1', 'test2', 'test3']);

		coubIDs.forEach((coubID) => {
			const coubDir = `${mediaDir}/${coubID}`; 
			fs.readdirSync(coubDir).forEach(file => {
				expect(checkFileHash(`${coubDir}/${file}`)).toMatchSnapshot();
			});
		});

		fs.rmdirSync(outputDir, {recursive: true});
	});
});
