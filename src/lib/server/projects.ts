import { sql } from "./db";
import { RANKING_TYPES } from "$lib/rankings";
import type {
  Project,
  RankedProject,
  RankingFilter,
  RankingType,
} from "$lib/types";

function mapRankedProjects(
  rows: Array<Record<string, any>>,
  filter: RankingType,
): RankedProject[] {
  return rows.map((row) => ({
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

export async function getProjectsPage(
  filter: RankingFilter = "hot",
  limit = 20,
  offset = 0,
): Promise<{ projects: RankedProject[]; total: number }> {
  if (filter === "recent") {
    const results = await sql`
      SELECT p.*
      FROM projects p
      WHERE p.is_archived = false
      ORDER BY p.updated_at DESC, p.stars DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;
    const count = await sql`
      SELECT COUNT(*) as count
      FROM projects p
      WHERE p.is_archived = false
    `;

    return {
      projects: results.map((row) => ({
        ...row,
        topics: row.topics || [],
      })) as RankedProject[],
      total: Number(count[0]?.count ?? 0),
    };
  }

  const rankingFilter = RANKING_TYPES.includes(filter as RankingType)
    ? (filter as RankingType)
    : "hot";

  const newFilterClause = filter === "new"
    ? sql`
      AND (
        p.github_created_at > NOW() - INTERVAL '90 days'
        OR p.created_at > NOW() - INTERVAL '90 days'
      )
    `
    : sql``;

  let orderBy = sql`
    ORDER BY
      CASE WHEN pr.rank_position IS NOT NULL THEN pr.rank_position ELSE 999999 END ASC,
      p.stars DESC
  `;

  if (filter === "hot") {
    orderBy = sql`
      ORDER BY
        CASE WHEN pr.rank_position IS NOT NULL THEN pr.rank_position ELSE 999999 END ASC,
        p.last_commit_at DESC NULLS LAST,
        p.weekly_downloads DESC,
        p.stars DESC
    `;
  } else if (filter === "trending") {
    orderBy = sql`
      ORDER BY
        CASE WHEN pr.rank_position IS NOT NULL THEN pr.rank_position ELSE 999999 END ASC,
        p.weekly_downloads DESC,
        p.stars DESC
    `;
  } else if (filter === "new") {
    orderBy = sql`
      ORDER BY
        CASE WHEN pr.rank_position IS NOT NULL THEN pr.rank_position ELSE 999999 END ASC,
        COALESCE(p.github_created_at, p.created_at) DESC,
        p.stars DESC
    `;
  }

  const results = await sql`
    SELECT
      p.*,
      pr.score,
      pr.rank_position,
      pr.score_breakdown,
      pr.computed_at as ranking_computed_at
    FROM projects p
    LEFT JOIN project_rankings pr ON p.id = pr.project_id AND pr.ranking_type = ${rankingFilter}
    WHERE p.is_archived = false
    ${newFilterClause}
    ${orderBy}
    LIMIT ${limit}
    OFFSET ${offset}
  `;

  const count = await sql`
    SELECT COUNT(*) as count
    FROM projects p
    WHERE p.is_archived = false
    ${newFilterClause}
  `;

  return {
    projects: mapRankedProjects(results, rankingFilter),
    total: Number(count[0]?.count ?? 0),
  };
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const results = await sql`
    SELECT * FROM projects WHERE slug = ${slug} LIMIT 1
  `;
  if (results.length === 0) return null;
  return { ...results[0], topics: results[0].topics || [] } as Project;
}

export async function getFeaturedProjects(
  limit = 6,
  offset = 0,
): Promise<Project[]> {
  const results = await sql`
    SELECT * FROM projects
    WHERE is_featured = true AND is_archived = false
    ORDER BY stars DESC, updated_at DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `;
  return results.map((row) => ({
    ...row,
    topics: row.topics || [],
  })) as Project[];
}

export async function getFeaturedProjectCount(): Promise<number> {
  const results = await sql`
    SELECT COUNT(*) as count
    FROM projects
    WHERE is_featured = true AND is_archived = false
  `;
  return Number(results[0]?.count ?? 0);
}

export async function searchProjectsPage(
  query: string,
  limit = 20,
  offset = 0,
): Promise<{ projects: Project[]; total: number }> {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return { projects: [], total: 0 };
  }

  const searchTerm = `%${trimmedQuery}%`;
  const exactTerm = trimmedQuery;
  const prefixTerm = `${trimmedQuery}%`;

  const results = await sql`
    SELECT * FROM projects
    WHERE
      (name ILIKE ${searchTerm} OR description ILIKE ${searchTerm})
      AND is_archived = false
    ORDER BY
      CASE
        WHEN name ILIKE ${exactTerm} THEN 0
        WHEN name ILIKE ${prefixTerm} THEN 1
        WHEN name ILIKE ${searchTerm} THEN 2
        WHEN description ILIKE ${searchTerm} THEN 3
        ELSE 4
      END,
      stars DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `;

  const count = await sql`
    SELECT COUNT(*) as count
    FROM projects
    WHERE
      (name ILIKE ${searchTerm} OR description ILIKE ${searchTerm})
      AND is_archived = false
  `;

  return {
    projects: results.map((row) => ({
      ...row,
      topics: row.topics || [],
    })) as Project[],
    total: Number(count[0]?.count ?? 0),
  };
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
