import type { ModalPopup } from './index.d';

declare global {
	interface Window {
		ModalPopup: ModalPopup;
		jQuery: typeof jQuery;
	}
}

export {};
