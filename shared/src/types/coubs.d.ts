export type CoubsType = 'favorites' | 'likes';

export interface CoubsJson {
	coubs: unknown[];
	page: number;
	total_pages: number;
}
