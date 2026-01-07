import type { PageServerLoad } from "./$types";
import {
  getFeaturedProjects,
  getProjectsPage,
  getProjectStats,
} from "$lib/server/projects";
import { RANKING_FILTERS } from "$lib/rankings";
import type { RankingFilter } from "$lib/types";

export const load: PageServerLoad = async ({ url }) => {
  const filter = (url.searchParams.get("filter") as RankingFilter) || "hot";
  const pageParam = Number.parseInt(url.searchParams.get("page") || "1");
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  const limit = 18;
  const offset = (page - 1) * limit;

  const safeFilter = RANKING_FILTERS.includes(filter) ? filter : "hot";

  const [projectsPage, featured, stats] = await Promise.all([
    getProjectsPage(safeFilter, limit, offset),
    getFeaturedProjects(3, 0),
    getProjectStats(),
  ]);

  return {
    projects: projectsPage.projects,
    pagination: {
      page,
      limit,
      total: projectsPage.total,
      totalPages: Math.max(Math.ceil(projectsPage.total / limit), 1),
    },
    featured,
    stats,
    filter: safeFilter,
  };
};
