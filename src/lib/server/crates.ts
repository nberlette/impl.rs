import { sql } from "./db";

interface CrateInfo {
  crate: {
    name: string;
    downloads: number;
    recent_downloads: number;
    description: string;
    documentation: string | null;
    repository: string | null;
    created_at: string;
    updated_at: string;
  };
  versions: Array<{
    num: string;
    created_at: string;
    downloads: number;
  }>;
}

interface CrateSearchResult {
  crates: Array<{
    name: string;
    downloads: number;
    recent_downloads: number;
    description: string;
    repository: string | null;
  }>;
  meta: {
    total: number;
  };
}

interface ReverseDependencies {
  dependencies: Array<{
    crate_id: string;
  }>;
  meta: {
    total: number;
  };
}

interface CrateDependencies {
  dependencies: Array<{
    crate_id: string;
    kind: string;
  }>;
}

const CRATES_API_BASE = "https://crates.io/api/v1";

function encodeCrateName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return null;
  return encodeURIComponent(trimmed);
}

async function fetchCrates<T>(endpoint: string): Promise<T | null> {
  try {
    const response = await fetch(`${CRATES_API_BASE}${endpoint}`, {
      headers: {
        "User-Agent": "impl-rs-bot (https://impl.rs)",
      },
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      console.error(
        `crates.io API error: ${response.status} ${response.statusText}`,
      );
      return null;
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error("crates.io fetch error:", error);
    return null;
  }
}

export async function getCrateInfo(name: string): Promise<CrateInfo | null> {
  const encoded = encodeCrateName(name);
  if (!encoded) return null;
  return fetchCrates<CrateInfo>(`/crates/${encoded}`);
}

export async function searchCrates(
  query: string,
  perPage = 100,
): Promise<CrateSearchResult | null> {
  const url = `/crates?q=${
    encodeURIComponent(query)
  }&per_page=${perPage}&sort=downloads`;
  return fetchCrates<CrateSearchResult>(url);
}

export async function getReverseDependencies(
  crateName: string,
): Promise<number> {
  const encoded = encodeCrateName(crateName);
  if (!encoded) return 0;
  const result = await fetchCrates<ReverseDependencies>(
    `/crates/${encoded}/reverse_dependencies`,
  );
  return result?.meta.total || 0;
}

export async function getDependenciesCount(crateName: string): Promise<number> {
  const encoded = encodeCrateName(crateName);
  if (!encoded) return 0;
  const result = await fetchCrates<CrateDependencies>(
    `/crates/${encoded}/dependencies`,
  );
  return result?.dependencies.length || 0;
}

export async function syncCratesData(projectId: number): Promise<boolean> {
  try {
    const project = await sql`
      SELECT crates_io_name, repository_name, repository_owner
      FROM projects WHERE id = ${projectId}
    `;

    if (project.length === 0) return false;

    let crateName = project[0].crates_io_name;

    if (!crateName) {
      crateName = project[0].repository_name;
    }
    if (!crateName?.trim()) return false;

    const crateInfo = await getCrateInfo(crateName);

    if (!crateInfo) {
      const searchResult = await searchCrates(project[0].repository_name, 5);
      const matchingCrate = searchResult?.crates.find(
        (c) =>
          c.repository?.includes(project[0].repository_owner) &&
          c.repository?.includes(project[0].repository_name),
      );

      if (matchingCrate) {
        crateName = matchingCrate.name;
        const retryInfo = await getCrateInfo(crateName);
        if (!retryInfo) return false;

        await updateProjectWithCrateData(projectId, crateName, retryInfo);
        return true;
      }

      return false;
    }

    await updateProjectWithCrateData(projectId, crateName, crateInfo);
    return true;
  } catch (error) {
    console.error(`Error syncing crates data for project ${projectId}:`, error);
    return false;
  }
}

async function updateProjectWithCrateData(
  projectId: number,
  crateName: string,
  crateInfo: CrateInfo,
): Promise<void> {
  const [dependents, dependencies] = await Promise.all([
    getReverseDependencies(crateName),
    getDependenciesCount(crateName),
  ]);
  const hasDocs = Boolean(crateInfo.crate.documentation);
  const lastVersion = crateInfo.versions.reduce(
    (latest, version) =>
      !latest || version.created_at > latest.created_at ? version : latest,
    null as CrateInfo["versions"][number] | null,
  );

  await sql`
    UPDATE projects SET
      crates_io_name = ${crateName},
      total_downloads = ${crateInfo.crate.downloads},
      weekly_downloads = ${crateInfo.crate.recent_downloads ?? 0},
      dependents_count = ${dependents},
      dependencies_count = ${dependencies},
      has_docs = ${hasDocs},
      last_release_at = ${lastVersion?.created_at || null},
      release_count = ${crateInfo.versions.length},
      updated_at = NOW()
    WHERE id = ${projectId}
  `;
}

export async function runCratesSync(_limit = 50): Promise<{
  synced: number;
  errors: number;
}> {
  const stats = { synced: 0, errors: 0 };

  const syncLog = await sql`
    INSERT INTO sync_logs (sync_type, status)
    VALUES ('crates', 'running')
    RETURNING id
  `;
  const syncLogId = syncLog[0].id;
  let cancelled = false;

  async function isCancelled(): Promise<boolean> {
    const status = await sql`
      SELECT status FROM sync_logs WHERE id = ${syncLogId}
    `;
    return status[0]?.status === "cancelled";
  }

  try {
    const projects = await sql`
      SELECT id FROM projects
      WHERE is_archived = false
      ORDER BY stars DESC
    `;

    let processed = 0;
    for (const project of projects) {
      processed++;
      if (processed % 10 === 0 && await isCancelled()) {
        cancelled = true;
        break;
      }
      const success = await syncCratesData(project.id);

      if (success) {
        stats.synced++;
      } else {
        stats.errors++;
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    if (cancelled) {
      await sql`
        UPDATE sync_logs SET
          status = 'cancelled',
          projects_updated = ${stats.synced},
          errors_count = ${stats.errors},
          completed_at = NOW()
        WHERE id = ${syncLogId}
      `;
    } else {
      await sql`
        UPDATE sync_logs SET
          status = 'completed',
          projects_updated = ${stats.synced},
          errors_count = ${stats.errors},
          completed_at = NOW()
        WHERE id = ${syncLogId}
      `;
    }
  } catch (error) {
    console.error("Crates sync error:", error);

    await sql`
      UPDATE sync_logs SET
        status = 'failed',
        projects_updated = ${stats.synced},
        errors_count = ${stats.errors + 1},
        error_details = ${JSON.stringify({ message: String(error) })},
        completed_at = NOW()
      WHERE id = ${syncLogId}
    `;
  }

  return stats;
}
