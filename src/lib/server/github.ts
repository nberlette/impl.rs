import { Buffer } from "node:buffer";
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

interface GitHubReadme {
  content: string;
  encoding: string;
}

interface GitHubCommitActivity {
  total: number;
  week: number;
  days: number[];
}

type GitHubLanguages = Record<string, number>;

const GITHUB_API_BASE = "https://api.github.com";
const GITHUB_MAX_BACKOFF_MS = 60_000;
let githubRateLimitResetAt: number | null = null;

function getGitHubToken(explicit?: string): string | undefined {
  return explicit || process.env.GITHUB_TOKEN || process.env.GITHUB_PAT;
}

function buildGitHubHeaders(token?: string): HeadersInit {
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "impl-rs-bot",
  };
  const resolvedToken = getGitHubToken(token);
  if (resolvedToken) {
    headers.Authorization = `Bearer ${resolvedToken}`;
  }
  return headers;
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function maybeWaitForStoredRateLimit(): Promise<void> {
  if (!githubRateLimitResetAt) return;
  const delayMs = githubRateLimitResetAt - Date.now();
  if (delayMs > 0) {
    await sleep(Math.min(delayMs, GITHUB_MAX_BACKOFF_MS));
  }
}

async function waitForRateLimitIfNeeded(response: Response): Promise<boolean> {
  if (response.status !== 403 && response.status !== 429) return false;

  const remaining = Number(
    response.headers.get("x-ratelimit-remaining") ?? "1",
  );
  const reset = Number(response.headers.get("x-ratelimit-reset") ?? "0");
  const retryAfter = Number(response.headers.get("retry-after") ?? "0");
  if (remaining > 0 && retryAfter <= 0 && reset <= 0) return false;

  const resetMs = reset
    ? reset * 1000
    : retryAfter
    ? Date.now() + retryAfter * 1000
    : null;
  if (!resetMs) return false;

  githubRateLimitResetAt = resetMs;
  const delayMs = Math.min(resetMs - Date.now(), GITHUB_MAX_BACKOFF_MS);
  if (delayMs > 0) {
    await sleep(delayMs);
  }
  return true;
}

function logGitHubError(response: Response): void {
  console.error(
    `GitHub API error: ${response.status} ${response.statusText}`,
  );
}

async function fetchGitHubResponse(
  endpoint: string,
  token?: string,
): Promise<Response | null> {
  const headers = buildGitHubHeaders(token);
  const url = `${GITHUB_API_BASE}${endpoint}`;
  try {
    await maybeWaitForStoredRateLimit();
    let response = await fetch(url, { headers });
    if (!response.ok) {
      const shouldRetry = await waitForRateLimitIfNeeded(response);
      if (shouldRetry) {
        await maybeWaitForStoredRateLimit();
        response = await fetch(url, { headers });
      }
    }
    return response;
  } catch (error) {
    console.error("GitHub fetch error:", error);
    return null;
  }
}

async function fetchGitHub<T>(
  endpoint: string,
  token?: string,
): Promise<T | null> {
  const response = await fetchGitHubResponse(endpoint, token);
  if (!response) return null;

  if (!response.ok) {
    logGitHubError(response);
    return null;
  }

  const data = await response.json();
  return data as T;
}

function parseLastPage(linkHeader: string | null): number | null {
  if (!linkHeader) return null;
  const parts = linkHeader.split(",");
  const lastLink = parts.find((part) => part.includes('rel="last"'));
  if (!lastLink) return null;
  const match = lastLink.match(/[?&]page=(\d+)/);
  return match ? Number.parseInt(match[1], 10) : null;
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
  try {
    const response = await fetchGitHubResponse(
      `/repos/${owner}/${repo}/contributors?per_page=1&anon=true`,
    );
    if (!response) return 0;

    if (!response.ok) {
      logGitHubError(response);
      return 0;
    }

    const contributors = await response.json() as Array<{ id: number }>;
    const lastPage = parseLastPage(response.headers.get("link"));
    if (lastPage !== null) return lastPage;
    return contributors.length || 0;
  } catch (error) {
    console.error("GitHub fetch error:", error);
    return 0;
  }
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

export async function getRepositoryReadme(
  owner: string,
  repo: string,
): Promise<{ hasReadme: boolean; content: string | null }> {
  try {
    const response = await fetchGitHubResponse(
      `/repos/${owner}/${repo}/readme`,
    );
    if (!response) return { hasReadme: false, content: null };

    if (response.status === 404) {
      return { hasReadme: false, content: null };
    }
    if (!response.ok) {
      logGitHubError(response);
      return { hasReadme: false, content: null };
    }

    const readme = await response.json() as GitHubReadme;
    if (!readme?.content) {
      return { hasReadme: false, content: null };
    }

    if (readme.encoding === "base64") {
      const content = Buffer.from(readme.content, "base64").toString("utf-8");
      return { hasReadme: true, content };
    }

    return { hasReadme: true, content: readme.content };
  } catch (error) {
    console.error("GitHub fetch error:", error);
    return { hasReadme: false, content: null };
  }
}

export async function getRepositoryLanguagePercent(
  owner: string,
  repo: string,
): Promise<number | null> {
  const languages = await fetchGitHub<GitHubLanguages>(
    `/repos/${owner}/${repo}/languages`,
  );

  if (!languages) return null;

  const entries = Object.entries(languages);
  if (entries.length === 0) return null;

  const total = entries.reduce((sum, [, bytes]) => sum + bytes, 0);
  if (total === 0) return null;

  const rustBytes = languages.Rust || 0;
  const percent = (rustBytes / total) * 100;
  return Number(percent.toFixed(2));
}

export async function getRepositoryCommitFrequency(
  owner: string,
  repo: string,
): Promise<number> {
  const activity = await fetchGitHub<GitHubCommitActivity[]>(
    `/repos/${owner}/${repo}/stats/commit_activity`,
  );
  if (!Array.isArray(activity) || activity.length === 0) return 0;

  const totalCommits = activity.reduce((sum, week) => sum + week.total, 0);
  const frequency = totalCommits / activity.length;
  return Number(frequency.toFixed(2));
}

async function syncProjectMetadata(
  projectId: number,
  repo: GitHubRepo,
): Promise<void> {
  const owner = repo.owner.login;
  const repoName = repo.name;
  const [
    contributors,
    releaseInfo,
    hasCi,
    readme,
    languagePercent,
    commitFrequency,
  ] = await Promise.all([
    getRepositoryContributors(owner, repoName),
    getRepositoryReleases(owner, repoName),
    checkHasCI(owner, repoName),
    getRepositoryReadme(owner, repoName),
    getRepositoryLanguagePercent(owner, repoName),
    getRepositoryCommitFrequency(owner, repoName),
  ]);

  const fullDescription = readme.content || repo.description;

  await sql`
    UPDATE projects SET
      contributors_count = ${contributors},
      release_count = ${releaseInfo.count},
      last_release_at = ${releaseInfo.lastRelease},
      has_ci = ${hasCi},
      has_readme = ${readme.hasReadme},
      has_license = ${repo.license !== null},
      readme_content = ${readme.content},
      full_description = ${fullDescription},
      language_percent = ${languagePercent},
      commit_frequency = ${commitFrequency},
      updated_at = NOW(),
      last_synced_at = NOW()
    WHERE id = ${projectId}
  `;
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
          repository_owner = ${repo.owner.login},
          repository_name = ${repo.name},
          stars = ${repo.stargazers_count},
          forks = ${repo.forks_count},
          watchers = ${repo.watchers_count},
          open_issues = ${repo.open_issues_count},
          license = ${repo.license?.name || null},
          has_license = ${repo.license !== null},
          topics = ${repo.topics},
          last_commit_at = ${repo.pushed_at},
          avatar_url = ${repo.owner.avatar_url},
          is_archived = ${repo.archived},
          github_created_at = ${repo.created_at},
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

export type GitHubSyncMode = "all" | "existing" | "discover";

export async function runGitHubSync(
  maxProjects = 100,
  mode: GitHubSyncMode = "all",
): Promise<{
  added: number;
  updated: number;
  errors: number;
}> {
  const stats = { added: 0, updated: 0, errors: 0 };
  const syncExisting = mode === "all" || mode === "existing";
  const discoverNew = mode === "all" || mode === "discover";

  const syncLog = await sql`
    INSERT INTO sync_logs (sync_type, status)
    VALUES (${mode === "all" ? "github" : `github_${mode}`}, 'running')
    RETURNING id
  `;
  const syncLogId = syncLog[0].id;
  let cancelled = false;
  const maxNewProjects = Math.max(maxProjects, 0);

  async function isCancelled(): Promise<boolean> {
    const status = await sql`
      SELECT status FROM sync_logs WHERE id = ${syncLogId}
    `;
    return status[0]?.status === "cancelled";
  }

  try {
    const existingIds = new Set<string>();
    const existingProjects = await sql`
      SELECT id, github_url, repository_owner, repository_name
      FROM projects
      WHERE is_archived = false
    `;
    existingProjects.forEach((project) => {
      if (project.github_url) existingIds.add(project.github_url);
    });

    let processed = 0;
    if (syncExisting) {
      for (const project of existingProjects) {
        processed++;
        if (processed % 10 === 0 && await isCancelled()) {
          cancelled = true;
          break;
        }
        if (!project.repository_owner || !project.repository_name) continue;

        const repo = await getRepositoryDetails(
          project.repository_owner,
          project.repository_name,
        );
        if (!repo) {
          stats.errors++;
          continue;
        }

        const projectId = await upsertProject(repo);
        if (projectId) {
          stats.updated++;
          existingIds.add(repo.html_url);
          await syncProjectMetadata(projectId, repo);
          await recordSnapshot(projectId);
        } else {
          stats.errors++;
        }
      }
    }

    if (!cancelled && discoverNew && maxNewProjects > 0) {
      const repos = await searchRustProjects("stars", "desc", 100, 1);
      for (const repo of repos) {
        if (stats.added >= maxNewProjects) break;
        processed++;
        if (processed % 10 === 0 && await isCancelled()) {
          cancelled = true;
          break;
        }
        if (repo.archived) continue;
        if (existingIds.has(repo.html_url)) continue;

        const projectId = await upsertProject(repo);
        if (projectId) {
          stats.added++;
          existingIds.add(repo.html_url);
          await syncProjectMetadata(projectId, repo);
          await recordSnapshot(projectId);
        } else {
          stats.errors++;
        }
      }
    }

    if (!cancelled && discoverNew && stats.added < maxNewProjects) {
      const recentRepos = await searchRustProjects("updated", "desc", 50, 1);
      for (const repo of recentRepos) {
        if (stats.added >= maxNewProjects) break;
        processed++;
        if (processed % 10 === 0 && await isCancelled()) {
          cancelled = true;
          break;
        }
        if (repo.archived) continue;
        if (repo.stargazers_count < 10) continue;
        if (existingIds.has(repo.html_url)) continue;

        const projectId = await upsertProject(repo);
        if (projectId) {
          stats.added++;
          existingIds.add(repo.html_url);
          await syncProjectMetadata(projectId, repo);
          await recordSnapshot(projectId);
        } else {
          stats.errors++;
        }
      }
    }

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
