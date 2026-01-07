import type { PageServerLoad } from "./$types";
import {
  getFeaturedProjectCount,
  getFeaturedProjects,
} from "$lib/server/projects";

export const load: PageServerLoad = async ({ url }) => {
  const pageParam = Number.parseInt(url.searchParams.get("page") || "1");
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  const limit = 18;
  const offset = (page - 1) * limit;

  const [projects, total] = await Promise.all([
    getFeaturedProjects(limit, offset),
    getFeaturedProjectCount(),
  ]);

  return {
    projects,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    },
  };
};
