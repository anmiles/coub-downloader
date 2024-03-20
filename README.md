# coub-downloader

Download favorite and liked coubs into local html file

----

## Installation

```bash
git clone https://github.com/anmiles/coub-downloader.git
cd coub-downloader
npm clean-install
npm run build
```

## Adding profiles

This application may work with multiple profiles (download videos liked from multiple youtube accounts).

1. Come up with any profile name you want
1. Execute `npm run create <profile>`
You can create as many profiles as you want.

## Downloading

1. Download all coubs metadata
	- Copy script from `./client/dist/index.js` into clipboard
	- Open `https://coub.com` in the browser
	- Log in
	- Open developer console
	- Paste script and execute
		- note to remove `export ` word at the very top of the script
	- When asked, choose profile (see [Adding profiles](#adding-profiles) above).
	- Look at the downloading progress
	- JSON file will be asked to download, save it into the `input` directory
2. Download all coubs media files
	- `npm start`

## Usage

Open the file `output/index.html` in the browser.
You can copy entire `output` folder and paste it anywhere or save to USB drive. This is your full backup of all your favourited or liked coubs in highest quality.
