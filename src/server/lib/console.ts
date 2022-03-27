export default class Console {
	enabled: boolean;

	constructor(enabled = true) {
		this.enabled = enabled;
	}

	log(text: string) {
		if (this.enabled) global.console.log(text);
	}
	warn(text: string) {
		if (this.enabled) global.console.warn(text);
	}
	error(text: string) {
		if (this.enabled) global.console.error(text);
	}
}
