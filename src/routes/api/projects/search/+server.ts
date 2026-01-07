import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { searchProjectsPage } from "$lib/server/projects";

export const GET: RequestHandler = async ({ url }) => {
  const query = url.searchParams.get("q") || "";
  const limit = Math.min(
    Number.parseInt(url.searchParams.get("limit") || "20"),
    100,
  );
  const offset = Number.parseInt(url.searchParams.get("offset") || "0");

  if (!query.trim()) {
    return json({ projects: [], query: "", total: 0, limit, offset });
  }

  try {
    const results = await searchProjectsPage(query, limit, offset);
    return json({
      projects: results.projects,
      total: results.total,
      query,
      limit,
      offset,
    });
  } catch (err) {
    console.error("Search API error:", err);
    return json({ error: "Failed to search projects" }, { status: 500 });
  }
};
