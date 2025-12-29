import { sql } from "./db";
import type { Project, RankedProject, RankingFilter } from "$lib/types";

export async function getProjects(
  filter: RankingFilter = "hot",
  limit = 20,
  offset = 0,
): Promise<RankedProject[]> {
  const results = await sql`
    SELECT 
      p.*,
      pr.score,
      pr.rank_position,
      pr.score_breakdown,
      pr.computed_at as ranking_computed_at
    FROM projects p
    LEFT JOIN project_rankings pr ON p.id = pr.project_id AND pr.ranking_type = ${filter}
    WHERE p.is_archived = false
    ORDER BY 
      CASE WHEN pr.rank_position IS NOT NULL THEN pr.rank_position ELSE 999999 END ASC,
      p.stars DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `;

  return results.map((row) => ({
    ...row,
    topics: row.topics || [],
    ranking: row.score
      ? {
        id: 0,
        project_id: row.id,
        ranking_type: filter,
        score: row.score,
        rank_position: row.rank_position,
        score_breakdown: row.score_breakdown,
        computed_at: row.ranking_computed_at,
      }
      : undefined,
  })) as RankedProject[];
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const results = await sql`
    SELECT * FROM projects WHERE slug = ${slug} LIMIT 1
  `;
  if (results.length === 0) return null;
  return { ...results[0], topics: results[0].topics || [] } as Project;
}

export async function getFeaturedProjects(): Promise<Project[]> {
  const results = await sql`
    SELECT * FROM projects 
    WHERE is_featured = true AND is_archived = false
    ORDER BY stars DESC
    LIMIT 6
  `;
  return results.map((row) => ({
    ...row,
    topics: row.topics || [],
  })) as Project[];
}

export async function searchProjects(
  query: string,
  limit = 20,
): Promise<Project[]> {
  const searchTerm = `%${query}%`;
  const results = await sql`
    SELECT * FROM projects
    WHERE 
      (name ILIKE ${searchTerm} OR description ILIKE ${searchTerm})
      AND is_archived = false
    ORDER BY stars DESC
    LIMIT ${limit}
  `;
  return results.map((row) => ({
    ...row,
    topics: row.topics || [],
  })) as Project[];
}

export async function getProjectCount(): Promise<number> {
  const results = await sql`
    SELECT COUNT(*) as count FROM projects WHERE is_archived = false
  `;
  return Number(results[0].count);
}

export async function getProjectStats(): Promise<{
  totalProjects: number;
  totalStars: number;
  totalDownloads: number;
  recentlyUpdated: number;
}> {
  const results = await sql`
    SELECT 
      COUNT(*) as total_projects,
      COALESCE(SUM(stars), 0) as total_stars,
      COALESCE(SUM(total_downloads), 0) as total_downloads,
      COUNT(*) FILTER (WHERE updated_at > NOW() - INTERVAL '7 days') as recently_updated
    FROM projects
    WHERE is_archived = false
  `;
  return {
    totalProjects: Number(results[0].total_projects),
    totalStars: Number(results[0].total_stars),
    totalDownloads: Number(results[0].total_downloads),
    recentlyUpdated: Number(results[0].recently_updated),
  };
}
