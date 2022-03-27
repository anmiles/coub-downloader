export type ModalPopup = {
	show: ({content, classes}: {content: string, classes: string}) => ModalPopup;
	setContent: (content: string) => ModalPopup;
	popup: {
		close: () => void;
	};
};

export type CoubsType = 'likes' | 'favourites';

export type CoubsJson = {
	coubs: unknown[],
	page: number,
	total_pages: number,
}

export {};
