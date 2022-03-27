# coub-download

Downloads your favourite and liked coubs into local html file

> WARNING
> This software is being provided "as-is".
> Author was fully tested it in his environment but doesn't guarantee it to be working samely on your computer.
> Make sure that you understand what you do.
> Never execute external code in your developer console or launch unknown HTML files on your computer.

## Installation

1. Install dependencies
`npm run install`
2. Build browser script
`npm run build:client`
3. Build server script
`npm run build:server`
4. Test everything
`npm run test`

## Downloading

1. Download all coubs metadata
	- copy script from `./dist/client/index.html` into clipboard
	- open `https://coub.com` in the browser and log in
	- open developer console
	- paste script and execute
		- note to remove `export ` at the very top of the script
	- look at the downloading progress
	- JSON file will be asked to download, save it as `input/coubs.json`
2. Download all coubs media files
	- `npm start ./input/coubs.json output`

## Usage

Open the file `output/index.html` in the browser.
You can copy entire `output` folder and paste it anywhere or save to USB drive. This is your full backup of all your favourited or liked coubs in highest quality.
