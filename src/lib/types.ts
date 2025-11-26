export interface Project {
  id: number
  slug: string
  name: string
  description: string | null
  full_description: string | null
  github_url: string
  homepage_url: string | null
  crates_io_name: string | null
  repository_owner: string
  repository_name: string
  stars: number
  forks: number
  watchers: number
  open_issues: number
  contributors_count: number
  commit_frequency: number
  last_commit_at: string | null
  last_release_at: string | null
  release_count: number
  license: string | null
  language_percent: number | null
  topics: string[]
  weekly_downloads: number
  total_downloads: number
  dependents_count: number
  dependencies_count: number
  has_readme: boolean
  has_license: boolean
  has_ci: boolean
  has_docs: boolean
  readme_content: string | null
  avatar_url: string | null
  og_image_url: string | null
  is_user_submitted: boolean
  is_featured: boolean
  is_archived: boolean
  created_at: string
  updated_at: string
  github_created_at: string | null
  last_synced_at: string | null
}

export interface ProjectRanking {
  id: number
  project_id: number
  ranking_type: "hot" | "trending" | "new" | "top"
  score: number
  rank_position: number
  score_breakdown: {
    star_velocity?: number
    activity_score?: number
    community_score?: number
    growth_rate?: number
    acceleration?: number
    release_activity?: number
    age_penalty?: number
    initial_traction?: number
    quality_signals?: number
    total_stars?: number
    maturity?: number
    ecosystem_impact?: number
  } | null
  computed_at: string
}

export interface RankedProject extends Project {
  ranking?: ProjectRanking
}

export interface UserSubmission {
  id: number
  github_url: string
  submitted_by_email: string | null
  submitted_by_name: string | null
  reason: string | null
  status: "pending" | "approved" | "rejected"
  project_id: number | null
  reviewed_by: number | null
  reviewed_at: string | null
  review_notes: string | null
  created_at: string
}

export interface AdminUser {
  id: number
  email: string
  name: string | null
  role: "admin" | "moderator"
  last_login_at: string | null
  created_at: string
}

export interface SyncLog {
  id: number
  sync_type: string
  status: string
  projects_added: number
  projects_updated: number
  errors_count: number
  error_details: Record<string, unknown> | null
  started_at: string
  completed_at: string | null
}

export interface SiteSetting {
  id: number
  key: string
  value: unknown
  description: string | null
  updated_at: string
}

export interface User {
  id: number
  github_id: number
  github_username: string
  name: string | null
  email: string | null
  avatar_url: string | null
  starred_projects: number[]
  created_at: string
  updated_at: string
}

export type RankingFilter = "hot" | "trending" | "new" | "top"
