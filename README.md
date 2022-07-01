# coub-download

Downloads your favourite and liked coubs into local html file

----

## IMPORTANT! Migration to v2

*You can skip this section if you clone the repository first time.*

**Getting compatible with multi-profile support**
1. Come up with a profile name that will be used for your named profile
1. Run `npm run migrate profile` (where `profile` is profile name your chosen).
	- This will rename all profile files into appropriate ones.
	- The command will throw an error if destination files already exist.
	- The command will do nothing if you still didn't have any data
1. You can add more profiles, see [Adding profiles](#adding-profiles) below.

----

## Installation

1. Install dependencies
`npm install`
1. Build
`npm run build`
1. Test everything
`npm test`

<a name="adding-profiles"></a>
## Adding profiles

This application may work with multiple profiles (download videos liked from multiple coub accounts).

1. Come up with any profile name you want
1. Execute `npm run create profile`, where `profile` is profile name your came up with
You can create as many profiles as you want.

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
