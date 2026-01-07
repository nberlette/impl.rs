import { RANKING_TYPES } from "$lib/rankings";
import type { RankingType } from "$lib/types";

export const match = (p: string): p is RankingType => {
  return RANKING_TYPES.includes(p.trim().toLowerCase() as RankingType);
};
