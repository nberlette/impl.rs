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

const CRATES_API_BASE = "https://crates.io/api/v1";

async function fetchCrates<T>(endpoint: string): Promise<T | null> {
  try {
    const response = await fetch(`${CRATES_API_BASE}${endpoint}`, {
      headers: {
        "User-Agent": "impl-rs-bot (https://impl.rs)",
      },
    });

    if (!response.ok) {
      console.error(`crates.io API error: ${response.status}`);
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
  return fetchCrates<CrateInfo>(`/crates/${name}`);
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
  const result = await fetchCrates<ReverseDependencies>(
    `/crates/${crateName}/reverse_dependencies`,
  );
  return result?.meta.total || 0;
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
  const dependents = await getReverseDependencies(crateName);
  const hasDocsRs = crateInfo.crate.documentation?.includes("docs.rs") || true;
  const lastVersion = crateInfo.versions[0];

  await sql`
    UPDATE projects SET
      crates_io_name = ${crateName},
      total_downloads = ${crateInfo.crate.downloads},
      weekly_downloads = ${crateInfo.crate.recent_downloads},
      dependents_count = ${dependents},
      has_docs = ${hasDocsRs},
      last_release_at = ${lastVersion?.created_at || null},
      release_count = ${crateInfo.versions.length},
      updated_at = NOW()
    WHERE id = ${projectId}
  `;
}

export async function runCratesSync(limit = 50): Promise<{
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

  try {
    const projects = await sql`
      SELECT id FROM projects
      WHERE is_archived = false
      ORDER BY stars DESC
      LIMIT ${limit}
    `;

    for (const project of projects) {
      const success = await syncCratesData(project.id);

      if (success) {
        stats.synced++;
      } else {
        stats.errors++;
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    await sql`
      UPDATE sync_logs SET
        status = 'completed',
        projects_updated = ${stats.synced},
        errors_count = ${stats.errors},
        completed_at = NOW()
      WHERE id = ${syncLogId}
    `;
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
