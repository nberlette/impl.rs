import { sql } from "./db"
import type { AdminUser, UserSubmission, SyncLog, Project } from "$lib/types"

export async function getAdminByEmail(email: string): Promise<AdminUser | null> {
  const results = await sql`
    SELECT id, email, name, role, last_login_at, created_at
    FROM admin_users
    WHERE email = ${email}
    LIMIT 1
  `
  return results.length > 0 ? (results[0] as AdminUser) : null
}

export async function verifyAdminPassword(email: string, passwordHash: string): Promise<AdminUser | null> {
  const results = await sql`
    SELECT id, email, name, role, last_login_at, created_at
    FROM admin_users
    WHERE email = ${email} AND password_hash = ${passwordHash}
    LIMIT 1
  `
  if (results.length > 0) {
    await sql`
      UPDATE admin_users SET last_login_at = NOW() WHERE email = ${email}
    `
    return results[0] as AdminUser
  }
  return null
}

export async function getPendingSubmissions(): Promise<UserSubmission[]> {
  const results = await sql`
    SELECT * FROM user_submissions
    WHERE status = 'pending'
    ORDER BY created_at DESC
  `
  return results as UserSubmission[]
}

export async function getAllSubmissions(limit = 50, offset = 0): Promise<UserSubmission[]> {
  const results = await sql`
    SELECT * FROM user_submissions
    ORDER BY created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `
  return results as UserSubmission[]
}

export async function updateSubmissionStatus(
  id: number,
  status: "approved" | "rejected",
  adminId: number,
  notes?: string,
): Promise<void> {
  await sql`
    UPDATE user_submissions
    SET 
      status = ${status},
      reviewed_by = ${adminId},
      reviewed_at = NOW(),
      review_notes = ${notes || null}
    WHERE id = ${id}
  `
}

export async function getSyncLogs(limit = 20): Promise<SyncLog[]> {
  const results = await sql`
    SELECT * FROM sync_logs
    ORDER BY started_at DESC
    LIMIT ${limit}
  `
  return results as SyncLog[]
}

export async function getAdminStats(): Promise<{
  totalProjects: number
  pendingSubmissions: number
  recentSyncs: number
  totalAdmins: number
  projectsThisWeek: number
  projectsThisMonth: number
}> {
  const results = await sql`
    SELECT
      (SELECT COUNT(*) FROM projects WHERE is_archived = false) as total_projects,
      (SELECT COUNT(*) FROM user_submissions WHERE status = 'pending') 
        as pending_submissions,
      (SELECT COUNT(*) FROM sync_logs 
       WHERE started_at > NOW() - INTERVAL '24 hours') as recent_syncs,
      (SELECT COUNT(*) FROM admin_users) as total_admins,
      (SELECT COUNT(*) FROM projects 
       WHERE created_at > NOW() - INTERVAL '7 days') as projects_this_week,
      (SELECT COUNT(*) FROM projects 
       WHERE created_at > NOW() - INTERVAL '30 days') as projects_this_month
  `
  return {
    totalProjects: Number(results[0].total_projects),
    pendingSubmissions: Number(results[0].pending_submissions),
    recentSyncs: Number(results[0].recent_syncs),
    totalAdmins: Number(results[0].total_admins),
    projectsThisWeek: Number(results[0].projects_this_week),
    projectsThisMonth: Number(results[0].projects_this_month),
  }
}

export async function getAllProjects(
  limit = 50,
  offset = 0,
  sortBy = "stars",
  sortOrder = "desc",
): Promise<{ projects: Project[]; total: number }> {
  const validSorts = ["stars", "created_at", "updated_at", "name"]
  const safeSortBy = validSorts.includes(sortBy) ? sortBy : "stars"
  const safeSortOrder = sortOrder === "asc" ? "ASC" : "DESC"

  const countResult = await sql`
    SELECT COUNT(*) as total FROM projects
  `

  const results = await sql`
    SELECT * FROM projects
    ORDER BY 
      CASE WHEN ${safeSortBy} = 'stars' AND ${safeSortOrder} = 'DESC' 
           THEN stars END DESC NULLS LAST,
      CASE WHEN ${safeSortBy} = 'stars' AND ${safeSortOrder} = 'ASC' 
           THEN stars END ASC NULLS LAST,
      CASE WHEN ${safeSortBy} = 'created_at' AND ${safeSortOrder} = 'DESC' 
           THEN created_at END DESC NULLS LAST,
      CASE WHEN ${safeSortBy} = 'created_at' AND ${safeSortOrder} = 'ASC' 
           THEN created_at END ASC NULLS LAST,
      CASE WHEN ${safeSortBy} = 'name' AND ${safeSortOrder} = 'DESC' 
           THEN name END DESC NULLS LAST,
      CASE WHEN ${safeSortBy} = 'name' AND ${safeSortOrder} = 'ASC' 
           THEN name END ASC NULLS LAST,
      stars DESC
    LIMIT ${limit} OFFSET ${offset}
  `

  return {
    projects: results.map((row) => ({
      ...row,
      topics: row.topics || [],
    })) as Project[],
    total: Number(countResult[0].total),
  }
}

export async function updateProject(id: number, data: Partial<Project>): Promise<void> {
  const updates: string[] = []
  const values: unknown[] = []

  if (data.is_featured !== undefined) {
    await sql`
      UPDATE projects SET is_featured = ${data.is_featured} WHERE id = ${id}
    `
  }
  if (data.is_archived !== undefined) {
    await sql`
      UPDATE projects SET is_archived = ${data.is_archived} WHERE id = ${id}
    `
  }
}

export async function deleteProject(id: number): Promise<void> {
  await sql`DELETE FROM projects WHERE id = ${id}`
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
  `
}

export async function getAuditLogs(limit = 50): Promise<
  Array<{
    id: number
    admin_user_id: number
    action: string
    entity_type: string
    entity_id: number
    metadata: Record<string, unknown>
    created_at: string
    admin_name?: string
  }>
> {
  const results = await sql`
    SELECT al.*, au.name as admin_name
    FROM audit_log al
    LEFT JOIN admin_users au ON al.admin_user_id = au.id
    ORDER BY al.created_at DESC
    LIMIT ${limit}
  `
  return results as Array<{
    id: number
    admin_user_id: number
    action: string
    entity_type: string
    entity_id: number
    metadata: Record<string, unknown>
    created_at: string
    admin_name?: string
  }>
}

export async function getSiteSettings(): Promise<Array<{ key: string; value: unknown; description: string | null }>> {
  const results = await sql`
    SELECT key, value, description FROM site_settings ORDER BY key
  `
  return results as Array<{
    key: string
    value: unknown
    description: string | null
  }>
}

export async function updateSiteSetting(key: string, value: unknown, adminId: number): Promise<void> {
  await sql`
    INSERT INTO site_settings (key, value, updated_by)
    VALUES (${key}, ${JSON.stringify(value)}, ${adminId})
    ON CONFLICT (key) DO UPDATE SET
      value = ${JSON.stringify(value)},
      updated_by = ${adminId},
      updated_at = NOW()
  `
}
