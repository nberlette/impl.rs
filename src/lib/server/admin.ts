import { sql } from "./db";
import type {
  AdminStats,
  AdminUser,
  Project,
  SiteSetting,
  SiteSettings,
  SyncLog,
  UserSubmission,
} from "$lib/types";
import {
  checkHasCI,
  getRepositoryContributors,
  getRepositoryDetails,
  getRepositoryReleases,
  upsertProject,
} from "./github";

function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "github.com") return null;
    const parts = parsed.pathname.replace(/^\/|\/$/g, "").split("/");
    if (parts.length < 2) return null;
    return { owner: parts[0], repo: parts[1] };
  } catch {
    return null;
  }
}

export async function getAdminByEmail(
  email: string,
): Promise<AdminUser | null> {
  const results = await sql`
    SELECT id, email, name, role, last_login_at, created_at
    FROM admin_users
    WHERE email = ${email}
    LIMIT 1
  ` as AdminUser[];
  return results?.length > 0 ? (results[0] as AdminUser) : null;
}

export async function verifyAdminPassword(
  email: string,
  passwordHash: string,
): Promise<AdminUser | null> {
  const results = await sql`
    SELECT id, email, name, role, last_login_at, created_at
    FROM admin_users
    WHERE email = ${email} AND password_hash = ${passwordHash}
    LIMIT 1
  ` as [AdminUser] | null;
  if (results?.length) {
    await sql`
      UPDATE admin_users SET last_login_at = NOW() WHERE email = ${email}
    `;
    return results[0] as AdminUser;
  }
  return null;
}

export async function getPendingSubmissions(): Promise<UserSubmission[]> {
  const results = await sql`
    SELECT * FROM user_submissions
    WHERE status = 'pending'
    ORDER BY created_at DESC
  `;
  return results as UserSubmission[];
}

export async function getAllSubmissions(
  limit = 50,
  offset = 0,
): Promise<UserSubmission[]> {
  const results = await sql`
    SELECT * FROM user_submissions
    ORDER BY created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  return results as UserSubmission[];
}

export async function updateSubmissionStatus(
  id: number,
  status: "approved" | "rejected",
  adminId: number,
  notes?: string,
): Promise<void> {
  status = status === "approved" ? status : "rejected";
  const submissions = await sql`
    SELECT * FROM user_submissions WHERE id = ${id} LIMIT 1
  `;

  if (!submissions.length) {
    throw new Error("Submission not found");
  }

  const submission = submissions[0] as UserSubmission;
  let projectId = submission.project_id;

  if (status === "approved") {
    const parsed = parseGitHubUrl(submission.github_url);
    if (!parsed) {
      throw new Error("Invalid GitHub URL");
    }

    const repo = await getRepositoryDetails(parsed.owner, parsed.repo);
    if (!repo) {
      throw new Error("GitHub repository not found");
    }

    projectId = await upsertProject(repo);
    if (!projectId) {
      throw new Error("Failed to create project");
    }

    const [contributors, releaseInfo, hasCi] = await Promise.all([
      getRepositoryContributors(parsed.owner, parsed.repo),
      getRepositoryReleases(parsed.owner, parsed.repo),
      checkHasCI(parsed.owner, parsed.repo),
    ]);

    await sql`
      UPDATE projects SET
        contributors_count = ${contributors},
        release_count = ${releaseInfo.count},
        last_release_at = ${releaseInfo.lastRelease},
        has_ci = ${hasCi},
        is_user_submitted = true,
        updated_at = NOW()
      WHERE id = ${projectId}
    `;
  }

  await sql`
    UPDATE user_submissions
    SET
      status = ${status},
      reviewed_by = ${adminId},
      reviewed_at = NOW(),
      review_notes = ${notes || null},
      project_id = ${projectId}
    WHERE id = ${id}
  `;

  await logAuditAction(
    adminId,
    status === "approved" ? "submission_approved" : "submission_rejected",
    "user_submission",
    id,
    projectId ? { project_id: projectId } : undefined,
  );
}

export async function getSyncLogs(limit = 20): Promise<SyncLog[]> {
  const results = await sql`
    SELECT * FROM sync_logs
    ORDER BY started_at DESC
    LIMIT ${limit}
  `;
  return results as SyncLog[];
}

export async function getAdminStats(): Promise<AdminStats> {
  const results = await sql`
    SELECT
      (SELECT COUNT(*) FROM projects
        WHERE is_archived = false) as total_projects,
      (SELECT COUNT(*) FROM user_submissions
        WHERE status = 'pending') as pending_submissions,
      (SELECT COUNT(*) FROM sync_logs
        WHERE started_at > NOW() - INTERVAL '24 hours') as recent_syncs,
      (SELECT COUNT(*) FROM projects
        WHERE created_at > NOW() - INTERVAL '7 days') as projects_this_week,
      (SELECT COUNT(*) FROM projects
        WHERE created_at > NOW() - INTERVAL '30 days') as projects_this_month,
      (SELECT COUNT(*) FROM admin_users) as total_admins
  `;

  return {
    totalProjects: Number(results[0].total_projects),
    pendingSubmissions: Number(results[0].pending_submissions),
    recentSyncs: Number(results[0].recent_syncs),
    totalAdmins: Number(results[0].total_admins),
    projectsThisWeek: Number(results[0].projects_this_week),
    projectsThisMonth: Number(results[0].projects_this_month),
  };
}

export async function getAllProjects(
  limit = 50,
  offset = 0,
  sortBy = "stars",
  sortOrder = "desc",
): Promise<{ projects: Project[]; total: number }> {
  const validSorts = ["stars", "created_at", "updated_at", "name"];
  sortBy = validSorts.includes(sortBy) ? sortBy : "stars";
  sortOrder = sortOrder.trim().toLowerCase() === "asc" ? "ASC" : "DESC";

  const countResult = await sql`
    SELECT COUNT(*) as total FROM projects
  `;

  const results = await sql`
    SELECT * FROM projects
    ORDER BY ${sortBy} DESC NULLS LAST, stars ASC
    LIMIT ${limit} OFFSET ${offset}
  `;

  return {
    projects: results.map((row) => ({
      ...row,
      topics: row.topics || [],
    })) as Project[],
    total: Number(countResult[0].total),
  };
}

export async function updateProject(
  id: number,
  data: Partial<Project>,
  adminId?: number,
): Promise<void> {
  const updates: string[] = [];
  const values: unknown[] = [];

  if (data.is_featured !== undefined) {
    await sql`
      UPDATE projects SET is_featured = ${data.is_featured} WHERE id = ${id}
    `;
  }
  if (data.is_archived !== undefined) {
    await sql`
      UPDATE projects SET is_archived = ${data.is_archived} WHERE id = ${id}
    `;
  }

  if (adminId) {
    await logAuditAction(adminId, "project_updated", "project", id, {
      is_featured: data.is_featured,
      is_archived: data.is_archived,
    });
  }
}

export async function deleteProject(
  id: number,
  adminId?: number,
): Promise<void> {
  await sql`DELETE FROM projects WHERE id = ${id}`;
  if (adminId) {
    await logAuditAction(adminId, "project_deleted", "project", id);
  }
}

export async function logAuditAction(
  adminId: number,
  action: string,
  entityType: string,
  entityId: number,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await sql`
    INSERT INTO audit_log (admin_user_id, action, entity_type, entity_id, metadata)
    VALUES (${adminId}, ${action}, ${entityType}, ${entityId},
            ${JSON.stringify(metadata || {})})
  `;
}

export async function getAuditLogs(limit = 50): Promise<
  Array<{
    id: number;
    admin_user_id: number;
    action: string;
    entity_type: string;
    entity_id: number;
    metadata: Record<string, unknown>;
    created_at: string;
    admin_name?: string;
  }>
> {
  const results = await sql`
    SELECT al.*, au.name as admin_name
    FROM audit_log al
    LEFT JOIN admin_users au ON al.admin_user_id = au.id
    ORDER BY al.created_at DESC
    LIMIT ${limit}
  `;
  return results as Array<{
    id: number;
    admin_user_id: number;
    action: string;
    entity_type: string;
    entity_id: number;
    metadata: Record<string, unknown>;
    created_at: string;
    admin_name?: string;
  }>;
}

export async function searchAuditLogs(options: {
  limit?: number;
  query?: string | null;
  action?: string | null;
  entityType?: string | null;
  adminName?: string | null;
  from?: string | null;
  to?: string | null;
}): Promise<
  Array<{
    id: number;
    admin_user_id: number;
    action: string;
    entity_type: string;
    entity_id: number;
    metadata: Record<string, unknown>;
    created_at: string;
    admin_name?: string;
  }>
> {
  const limit = options.limit ?? 200;
  const query = options.query?.trim() || null;
  const action = options.action?.trim() || null;
  const entityType = options.entityType?.trim() || null;
  const adminName = options.adminName?.trim() || null;
  const from = options.from?.trim() || null;
  const to = options.to?.trim() || null;

  const searchTerm = query ? `%${query}%` : null;
  const adminTerm = adminName ? `%${adminName}%` : null;

  const results = await sql`
    SELECT al.*, au.name as admin_name
    FROM audit_log al
    LEFT JOIN admin_users au ON al.admin_user_id = au.id
    WHERE
      (${searchTerm}::text IS NULL OR
        al.action ILIKE ${searchTerm}::text OR
        al.entity_type ILIKE ${searchTerm}::text OR
        al.entity_id::text ILIKE ${searchTerm}::text OR
        au.name ILIKE ${searchTerm}::text)
      AND (${action}::text IS NULL OR al.action = ${action}::text)
      AND (${entityType}::text IS NULL OR al.entity_type = ${entityType}::text)
      AND (${adminTerm}::text IS NULL OR au.name ILIKE ${adminTerm}::text)
      AND (${from}::timestamptz IS NULL OR al.created_at >= ${from}::timestamptz)
      AND (${to}::timestamptz IS NULL OR al.created_at <= ${to}::timestamptz)
    ORDER BY al.created_at DESC
    LIMIT ${limit}
  `;

  return results as Array<{
    id: number;
    admin_user_id: number;
    action: string;
    entity_type: string;
    entity_id: number;
    metadata: Record<string, unknown>;
    created_at: string;
    admin_name?: string;
  }>;
}

export async function getAuditLogFilters(): Promise<{
  actions: string[];
  entityTypes: string[];
  adminNames: string[];
}> {
  const actions = await sql`
    SELECT DISTINCT action FROM audit_log ORDER BY action
  `;
  const entityTypes = await sql`
    SELECT DISTINCT entity_type FROM audit_log ORDER BY entity_type
  `;
  const adminNames = await sql`
    SELECT DISTINCT name FROM admin_users WHERE name IS NOT NULL ORDER BY name
  `;

  return {
    actions: actions.map((row) => row.action).filter(Boolean),
    entityTypes: entityTypes.map((row) => row.entity_type).filter(Boolean),
    adminNames: adminNames.map((row) => row.name).filter(Boolean),
  };
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const results = await sql<SiteSetting>`
    SELECT DISTINCT ON (key) key, value, description
    FROM site_settings
    ORDER BY key, updated_at DESC NULLS LAST, id DESC
  `;
  return results;
}

export async function getSiteSettingValue<T>(
  key: string,
  fallback: T,
): Promise<T> {
  const results = await sql`
    SELECT value
    FROM site_settings
    WHERE key = ${key}
    ORDER BY updated_at DESC NULLS LAST, id DESC
    LIMIT 1
  `;

  if (!results.length || results[0]?.value === undefined) return fallback;
  return results[0].value as T;
}

export async function updateSiteSetting(
  key: string,
  value: unknown,
  adminId: number,
  description?: string,
): Promise<number> {
  const updated = description
    ? await sql`
        UPDATE site_settings SET
          value = ${JSON.stringify(value)},
          updated_by = ${adminId},
          updated_at = NOW(),
          description = COALESCE(description, ${description})
        WHERE key = ${key}
        RETURNING id
      `
    : await sql`
        UPDATE site_settings SET
          value = ${JSON.stringify(value)},
          updated_by = ${adminId},
          updated_at = NOW()
        WHERE key = ${key}
        RETURNING id
      `;

  if (updated.length === 0) {
    const inserted = await sql`
      INSERT INTO site_settings (key, value, description, updated_by)
      VALUES (
        ${key},
        ${JSON.stringify(value)},
        ${description ?? null},
        ${adminId}
      )
      RETURNING id
    `;
    return inserted[0]?.id || 0;
  }
  return updated[0]?.id || 0;
}
