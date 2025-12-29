import type { PageServerLoad } from "./$types";
import {
  getFeaturedProjects,
  getProjects,
  getProjectStats,
} from "$lib/server/projects";
import type { RankingFilter } from "$lib/types";

export const load: PageServerLoad = async ({ url }) => {
  const filter = (url.searchParams.get("filter") as RankingFilter) || "hot";
  const validFilters: RankingFilter[] = ["hot", "trending", "new", "top"];
  const safeFilter = validFilters.includes(filter) ? filter : "hot";

  const [projects, featured, stats] = await Promise.all([
    getProjects(safeFilter, 20, 0),
    getFeaturedProjects(),
    getProjectStats(),
  ]);

  return {
    projects,
    featured,
    stats,
    filter: safeFilter,
  };
};
