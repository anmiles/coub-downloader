# coub-downloader

Download favorite and liked coubs into local html file

----

## Installation

1. Install dependencies
`npm install`
1. Build
`npm run build`
1. Test everything
`npm test`

## Adding profiles

This application may work with multiple profiles (download videos liked from multiple youtube accounts).

1. Come up with any profile name you want
1. Execute `npm run create <profile>`
You can create as many profiles as you want.

## Authentication

`npm run login` to login into all existing profiles
`npm run login <profile>` to login into selected profile

## Downloading

1. Download all coubs metadata
	- Copy script from `./dist/client/index.js` into clipboard
	- Open `https://coub.com` in the browser
	- Log in
	- Open developer console
	- Paste script and execute
		- note to remove `export ` at the very top of the script
	- When asked, choose profile (see [Adding profiles](#adding-profiles) above).
	- Look at the downloading progress
	- JSON file will be asked to download, save it as to `input` directory
2. Download all coubs media files
	- `npm start`

## Usage

Open the file `output/index.html` in the browser.
You can copy entire `output` folder and paste it anywhere or save to USB drive. This is your full backup of all your favourited or liked coubs in highest quality.

## Known problems

- `npm run build` failed with `node_modules/@types/node/globals.d.ts:72:13 - error TS2403: Subsequent variable declarations must have the same type.  Variable 'AbortSignal' must be of type '{ new (): AbortSignal; prototype: AbortSignal; abort(reason?: any): AbortSignal; timeout(milliseconds: number): AbortSignal; }', but here has type '{ new (): AbortSignal; prototype: AbortSignal; }'.`
  - Just delete `node_modules` and run `npm install` again
