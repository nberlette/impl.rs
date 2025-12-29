import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { searchProjects } from "$lib/server/projects";

export const GET: RequestHandler = async ({ url }) => {
  const query = url.searchParams.get("q") || "";
  const limit = Math.min(
    Number.parseInt(url.searchParams.get("limit") || "20"),
    100,
  );

  if (!query.trim()) {
    return json({ projects: [], query: "" });
  }

  try {
    const projects = await searchProjects(query, limit);
    return json({ projects, query });
  } catch (err) {
    console.error("Search API error:", err);
    return json({ error: "Failed to search projects" }, { status: 500 });
  }
};
