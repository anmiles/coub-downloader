interface ModalPopup {
	show       : ({ content, classes }: { content : string; classes : string }) => ModalPopup;
	setContent : (content: string) => ModalPopup;
	popup: {
		close : () => void;
	};
}

export type { ModalPopup };
