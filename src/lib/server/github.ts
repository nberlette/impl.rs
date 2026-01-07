import { sql } from "./db";
import { slugify } from "$lib/utils";

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  license: { name: string } | null;
  topics: string[];
  created_at: string;
  updated_at: string;
  pushed_at: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  has_wiki: boolean;
  archived: boolean;
  default_branch: string;
}

interface GitHubSearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubRepo[];
}

const GITHUB_API_BASE = "https://api.github.com";

async function fetchGitHub<T>(
  endpoint: string,
  token?: string,
): Promise<T | null> {
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "impl-rs-bot",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, { headers });

    if (!response.ok) {
      console.error(
        `GitHub API error: ${response.status} ${response.statusText}`,
      );
      return null;
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error("GitHub fetch error:", error);
    return null;
  }
}

export async function searchRustProjects(
  sort: "stars" | "updated" = "stars",
  order: "desc" | "asc" = "desc",
  perPage = 100,
  page = 1,
): Promise<GitHubRepo[]> {
  const query = encodeURIComponent("language:rust stars:>10");
  const endpoint =
    `/search/repositories?q=${query}&sort=${sort}&order=${order}&per_page=${perPage}&page=${page}`;

  const response = await fetchGitHub<GitHubSearchResponse>(endpoint);
  return response?.items || [];
}

export async function getRepositoryDetails(
  owner: string,
  repo: string,
): Promise<GitHubRepo | null> {
  return fetchGitHub<GitHubRepo>(`/repos/${owner}/${repo}`);
}

export async function getRepositoryContributors(
  owner: string,
  repo: string,
): Promise<number> {
  const contributors = await fetchGitHub<Array<{ id: number }>>(
    `/repos/${owner}/${repo}/contributors?per_page=1&anon=true`,
  );
  return contributors?.length || 0;
}

export async function getRepositoryReleases(
  owner: string,
  repo: string,
): Promise<{ count: number; lastRelease: string | null }> {
  const releases = await fetchGitHub<Array<{ published_at: string }>>(
    `/repos/${owner}/${repo}/releases?per_page=100`,
  );

  if (!releases || releases.length === 0) {
    return { count: 0, lastRelease: null };
  }

  return {
    count: releases.length,
    lastRelease: releases[0]?.published_at || null,
  };
}

export async function checkHasCI(
  owner: string,
  repo: string,
): Promise<boolean> {
  const workflows = await fetchGitHub<{ total_count: number }>(
    `/repos/${owner}/${repo}/actions/workflows`,
  );
  return (workflows?.total_count || 0) > 0;
}

export async function upsertProject(repo: GitHubRepo): Promise<number | null> {
  const slug = slugify(`${repo.owner.login}-${repo.name}`);

  try {
    const existing = await sql`
      SELECT id FROM projects WHERE github_url = ${repo.html_url} LIMIT 1
    `;

    if (existing.length > 0) {
      await sql`
        UPDATE projects SET
          name = ${repo.name},
          description = ${repo.description},
          homepage_url = ${repo.homepage},
          stars = ${repo.stargazers_count},
          forks = ${repo.forks_count},
          watchers = ${repo.watchers_count},
          open_issues = ${repo.open_issues_count},
          license = ${repo.license?.name || null},
          topics = ${repo.topics},
          last_commit_at = ${repo.pushed_at},
          avatar_url = ${repo.owner.avatar_url},
          is_archived = ${repo.archived},
          updated_at = NOW(),
          last_synced_at = NOW()
        WHERE id = ${existing[0].id}
      `;
      return existing[0].id;
    } else {
      const result = await sql`
        INSERT INTO projects (
          slug, name, description, github_url, homepage_url,
          repository_owner, repository_name, stars, forks, watchers,
          open_issues, license, topics, avatar_url, is_archived,
          github_created_at, last_commit_at, last_synced_at, has_readme,
          has_license
        ) VALUES (
          ${slug}, ${repo.name}, ${repo.description}, ${repo.html_url},
          ${repo.homepage}, ${repo.owner.login}, ${repo.name},
          ${repo.stargazers_count}, ${repo.forks_count},
          ${repo.watchers_count}, ${repo.open_issues_count},
          ${repo.license?.name || null}, ${repo.topics},
          ${repo.owner.avatar_url}, ${repo.archived},
          ${repo.created_at}, ${repo.pushed_at}, NOW(),
          true, ${repo.license !== null}
        )
        RETURNING id
      `;
      return result[0]?.id || null;
    }
  } catch (error) {
    console.error(`Error upserting project ${repo.full_name}:`, error);
    return null;
  }
}

export async function recordSnapshot(projectId: number): Promise<void> {
  try {
    const project = await sql`
      SELECT stars, forks, watchers, open_issues, weekly_downloads,
             contributors_count
      FROM projects WHERE id = ${projectId}
    `;

    if (project.length > 0) {
      await sql`
        INSERT INTO project_snapshots (
          project_id, stars, forks, watchers, open_issues,
          weekly_downloads, contributors_count
        ) VALUES (
          ${projectId}, ${project[0].stars}, ${project[0].forks},
          ${project[0].watchers}, ${project[0].open_issues},
          ${project[0].weekly_downloads}, ${project[0].contributors_count}
        )
      `;
    }
  } catch (error) {
    console.error(`Error recording snapshot for project ${projectId}:`, error);
  }
}

export async function runGitHubSync(maxProjects = 100): Promise<{
  added: number;
  updated: number;
  errors: number;
}> {
  const stats = { added: 0, updated: 0, errors: 0 };

  const syncLog = await sql`
    INSERT INTO sync_logs (sync_type, status)
    VALUES ('github', 'running')
    RETURNING id
  `;
  const syncLogId = syncLog[0].id;
  let cancelled = false;
  const perPage = Math.min(Math.max(maxProjects, 1), 100);

  async function isCancelled(): Promise<boolean> {
    const status = await sql`
      SELECT status FROM sync_logs WHERE id = ${syncLogId}
    `;
    return status[0]?.status === "cancelled";
  }

  try {
    const existingIds = new Set<string>();
    const existingProjects = await sql`
      SELECT github_url FROM projects
    `;
    existingProjects.forEach((p) => existingIds.add(p.github_url));

    const repos = await searchRustProjects("stars", "desc", perPage, 1);
    let processed = 0;

    for (const repo of repos) {
      processed++;
      if (processed % 10 === 0 && await isCancelled()) {
        cancelled = true;
        break;
      }
      if (repo.archived) continue;

      const wasExisting = existingIds.has(repo.html_url);
      const projectId = await upsertProject(repo);

      if (projectId) {
        if (wasExisting) {
          stats.updated++;
        } else {
          stats.added++;
        }
        await recordSnapshot(projectId);
      } else {
        stats.errors++;
      }
    }

    const recentLimit = Math.min(50, perPage);
    const recentRepos = await searchRustProjects(
      "updated",
      "desc",
      recentLimit,
      1,
    );
    try {
      for (const repo of recentRepos) {
        processed++;
        if (processed % 10 === 0 && await isCancelled()) {
          cancelled = true;
          break;
        }
        if (repo.archived) continue;
        if (repo.stargazers_count < 10) continue;

        const wasExisting = existingIds.has(repo.html_url);
        const projectId = await upsertProject(repo);

        if (projectId) {
          if (!wasExisting && !existingIds.has(repo.html_url)) {
            stats.added++;
            existingIds.add(repo.html_url);
          }
        }
      }
    } finally {
      if (cancelled) {
        await sql`
          UPDATE sync_logs SET
            status = 'cancelled',
            projects_added = ${stats.added},
            projects_updated = ${stats.updated},
            errors_count = ${stats.errors},
            completed_at = NOW()
          WHERE id = ${syncLogId}
        `;
      } else {
        await sql`
          UPDATE sync_logs SET
            status = 'completed',
            projects_added = ${stats.added},
            projects_updated = ${stats.updated},
            errors_count = ${stats.errors},
            completed_at = NOW()
          WHERE id = ${syncLogId}
        `;
      }
    }
  } catch (error) {
    console.error("Sync error:", error);

    await sql`
      UPDATE sync_logs SET
        status = 'failed',
        projects_added = ${stats.added},
        projects_updated = ${stats.updated},
        errors_count = ${stats.errors + 1},
        error_details = ${JSON.stringify({ message: String(error) })},
        completed_at = NOW()
      WHERE id = ${syncLogId}
    `;
  }

  return stats;
}
