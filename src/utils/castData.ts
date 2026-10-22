import rawCastData from '../data/cast.json';
import { ChogNFT } from '../types/comic';

export interface RawCastItem {
  id: number;
  name: string;
  image: string;
  attributes: Array<{ trait_type: string; value: string }>;
}

export const SUPPORTING_CAST: ChogNFT[] = (rawCastData as RawCastItem[]).map((item) => ({
  tokenId: String(item.id),
  name: item.name,
  imageUrl: item.image.startsWith('/') ? item.image : `/${item.image}`,
  attributes: item.attributes,
}));

/**
 * Find a cast member by token ID or numeric index
 */
export function getCastMemberById(id: number | string): ChogNFT | undefined {
  const strId = String(id);
  return SUPPORTING_CAST.find((c) => c.tokenId === strId);
}
