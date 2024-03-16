type CoubsType = 'favourites' | 'likes';

interface CoubsJson {
	coubs       : unknown[];
	page        : number;
	total_pages : number;
}

export type { CoubsType, CoubsJson };
