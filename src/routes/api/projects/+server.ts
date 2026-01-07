import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getProjectsPage } from "$lib/server/projects";
import { RANKING_FILTERS } from "$lib/rankings";
import type { RankingFilter } from "$lib/types";

export const GET: RequestHandler = async ({ url }) => {
  const filter = (url.searchParams.get("filter") as RankingFilter) || "hot";
  const limit = Math.min(
    Number.parseInt(url.searchParams.get("limit") || "20"),
    100,
  );
  const offset = Number.parseInt(url.searchParams.get("offset") || "0");

  const safeFilter = RANKING_FILTERS.includes(filter) ? filter : "hot";

  try {
    const page = await getProjectsPage(safeFilter, limit, offset);
    return json({
      projects: page.projects,
      total: page.total,
      filter: safeFilter,
      limit,
      offset,
    });
  } catch (err) {
    console.error("API error:", err);
    return json({ error: "Failed to fetch projects" }, { status: 500 });
  }
};
