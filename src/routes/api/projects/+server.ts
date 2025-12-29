import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getProjects } from "$lib/server/projects";
import type { RankingFilter } from "$lib/types";

export const GET: RequestHandler = async ({ url }) => {
  const filter = (url.searchParams.get("filter") as RankingFilter) || "hot";
  const limit = Math.min(
    Number.parseInt(url.searchParams.get("limit") || "20"),
    100,
  );
  const offset = Number.parseInt(url.searchParams.get("offset") || "0");

  const validFilters: RankingFilter[] = ["hot", "trending", "new", "top"];
  const safeFilter = validFilters.includes(filter) ? filter : "hot";

  try {
    const projects = await getProjects(safeFilter, limit, offset);
    return json({ projects, filter: safeFilter, limit, offset });
  } catch (err) {
    console.error("API error:", err);
    return json({ error: "Failed to fetch projects" }, { status: 500 });
  }
};
