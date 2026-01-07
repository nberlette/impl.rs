import type { PageServerLoad } from "./$types";
import { searchProjectsPage } from "$lib/server/projects";

export const load: PageServerLoad = async ({ url }) => {
  const query = url.searchParams.get("q") || "";
  const pageParam = Number.parseInt(url.searchParams.get("page") || "1");
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  const limit = 20;
  const offset = (page - 1) * limit;

  if (!query.trim()) {
    return {
      query,
      projects: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 1,
      },
    };
  }

  const results = await searchProjectsPage(query, limit, offset);

  return {
    query,
    projects: results.projects,
    pagination: {
      page,
      limit,
      total: results.total,
      totalPages: Math.max(Math.ceil(results.total / limit), 1),
    },
  };
};
