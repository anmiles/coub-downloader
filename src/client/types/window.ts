import type { ModalPopup } from './modalPopup';

declare global {
	interface Window {
		ModalPopup: ModalPopup;
		jQuery: typeof jQuery;
	}
}
