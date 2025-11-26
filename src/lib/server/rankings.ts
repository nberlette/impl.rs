import { sql } from "./db"
import type { RankingFilter } from "$lib/types"

interface ProjectMetrics {
  id: number
  stars: number
  forks: number
  watchers: number
  open_issues: number
  contributors_count: number
  total_downloads: number
  weekly_downloads: number
  dependents_count: number
  release_count: number
  commit_frequency: number
  created_at: string
  github_created_at: string | null
  last_commit_at: string | null
  last_release_at: string | null
  has_readme: boolean
  has_license: boolean
  has_ci: boolean
  has_docs: boolean
}

interface SnapshotData {
  stars: number
  forks: number
  recorded_at: string
}

interface RankingResult {
  projectId: number
  score: number
  breakdown: Record<string, number>
}

function daysBetween(date1: Date, date2: Date): number {
  const diff = Math.abs(date2.getTime() - date1.getTime())
  return diff / (1000 * 60 * 60 * 24)
}

function normalizeScore(value: number, max: number): number {
  if (max === 0) return 0
  return Math.min(value / max, 1)
}

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x))
}

async function getProjectSnapshots(projectId: number, days: number): Promise<SnapshotData[]> {
  const snapshots = await sql`
    SELECT stars, forks, recorded_at
    FROM project_snapshots
    WHERE project_id = ${projectId}
      AND recorded_at > NOW() - INTERVAL '${days} days'
    ORDER BY recorded_at ASC
  `
  return snapshots as SnapshotData[]
}

async function calculateStarVelocity(project: ProjectMetrics, days: number): Promise<number> {
  const snapshots = await getProjectSnapshots(project.id, days)

  if (snapshots.length < 2) {
    if (project.github_created_at) {
      const age = daysBetween(new Date(project.github_created_at), new Date())
      if (age < days) {
        return project.stars / Math.max(age, 1)
      }
    }
    return 0
  }

  const oldestSnapshot = snapshots[0]
  const newestSnapshot = snapshots[snapshots.length - 1]
  const starsGained = newestSnapshot.stars - oldestSnapshot.stars
  const daysPassed = daysBetween(new Date(oldestSnapshot.recorded_at), new Date(newestSnapshot.recorded_at))

  return starsGained / Math.max(daysPassed, 1)
}

function calculateActivityScore(project: ProjectMetrics): number {
  let score = 0

  if (project.last_commit_at) {
    const daysSinceCommit = daysBetween(new Date(project.last_commit_at), new Date())
    if (daysSinceCommit < 7) score += 40
    else if (daysSinceCommit < 14) score += 30
    else if (daysSinceCommit < 30) score += 20
    else if (daysSinceCommit < 90) score += 10
  }

  score += Math.min(project.open_issues * 0.5, 20)

  if (project.last_release_at) {
    const daysSinceRelease = daysBetween(new Date(project.last_release_at), new Date())
    if (daysSinceRelease < 30) score += 20
    else if (daysSinceRelease < 90) score += 10
  }

  score += Math.min(project.commit_frequency * 2, 20)

  return Math.min(score, 100)
}

function calculateCommunityScore(project: ProjectMetrics): number {
  let score = 0

  score += Math.min(Math.log10(project.contributors_count + 1) * 20, 30)

  score += Math.min(Math.log10(project.forks + 1) * 10, 25)

  score += Math.min(Math.log10(project.watchers + 1) * 5, 15)

  score += Math.min(Math.log10(project.dependents_count + 1) * 10, 30)

  return Math.min(score, 100)
}

function calculateQualityScore(project: ProjectMetrics): number {
  let score = 0

  if (project.has_readme) score += 25
  if (project.has_license) score += 25
  if (project.has_ci) score += 25
  if (project.has_docs) score += 25

  return score
}

function calculateMaturityScore(project: ProjectMetrics): number {
  let score = 0

  if (project.github_created_at) {
    const ageInDays = daysBetween(new Date(project.github_created_at), new Date())
    score += Math.min(ageInDays / 365, 1) * 30
  }

  score += Math.min(project.release_count * 2, 30)

  if (project.last_commit_at) {
    const daysSinceCommit = daysBetween(new Date(project.last_commit_at), new Date())
    if (daysSinceCommit < 30) score += 20
    else if (daysSinceCommit < 90) score += 15
    else if (daysSinceCommit < 180) score += 10
    else if (daysSinceCommit < 365) score += 5
  }

  score += Math.min(Math.log10(project.total_downloads + 1) * 5, 20)

  return Math.min(score, 100)
}

function calculateEcosystemImpact(project: ProjectMetrics): number {
  let score = 0

  score += Math.min(Math.log10(project.dependents_count + 1) * 15, 40)

  score += Math.min(Math.log10(project.total_downloads + 1) * 8, 35)

  score += Math.min(Math.log10(project.forks + 1) * 8, 25)

  return Math.min(score, 100)
}

async function calculateHotScore(project: ProjectMetrics): Promise<RankingResult> {
  const starVelocity = await calculateStarVelocity(project, 7)
  const activityScore = calculateActivityScore(project)
  const communityScore = calculateCommunityScore(project)

  const normalizedVelocity = Math.min(starVelocity * 10, 100)

  const score = normalizedVelocity * 0.5 + activityScore * 0.3 + communityScore * 0.2

  return {
    projectId: project.id,
    score,
    breakdown: {
      star_velocity: normalizedVelocity,
      activity_score: activityScore,
      community_score: communityScore,
    },
  }
}

async function calculateTrendingScore(project: ProjectMetrics): Promise<RankingResult> {
  const currentVelocity = await calculateStarVelocity(project, 30)
  const previousVelocity = await calculateStarVelocity(project, 60)

  const growthRate = project.stars > 0 ? ((currentVelocity * 30) / project.stars) * 100 : currentVelocity

  let acceleration = 0
  if (previousVelocity > 0) {
    acceleration = ((currentVelocity - previousVelocity) / previousVelocity) * 100
  } else if (currentVelocity > 0) {
    acceleration = 100
  }

  let releaseActivity = 0
  if (project.last_release_at) {
    const daysSinceRelease = daysBetween(new Date(project.last_release_at), new Date())
    if (daysSinceRelease < 30) releaseActivity = 100
    else if (daysSinceRelease < 60) releaseActivity = 70
    else if (daysSinceRelease < 90) releaseActivity = 40
  }

  releaseActivity += Math.min(project.weekly_downloads / 1000, 50)

  const normalizedGrowth = Math.min(growthRate * 5, 100)
  const normalizedAccel = sigmoid(acceleration / 50) * 100

  const score = normalizedGrowth * 0.4 + normalizedAccel * 0.3 + releaseActivity * 0.3

  return {
    projectId: project.id,
    score,
    breakdown: {
      growth_rate: normalizedGrowth,
      acceleration: normalizedAccel,
      release_activity: releaseActivity,
    },
  }
}

async function calculateNewScore(project: ProjectMetrics): Promise<RankingResult | null> {
  if (!project.github_created_at) return null

  const ageInDays = daysBetween(new Date(project.github_created_at), new Date())

  if (ageInDays > 90) return null

  const initialTraction = project.stars / Math.max(ageInDays, 1)
  const qualityScore = calculateQualityScore(project)

  const normalizedTraction = Math.min(initialTraction * 5, 100)

  const agePenalty = 1 - ageInDays / 90
  const score = (normalizedTraction * 0.5 + qualityScore * 0.5) * (0.5 + agePenalty * 0.5)

  return {
    projectId: project.id,
    score,
    breakdown: {
      initial_traction: normalizedTraction,
      quality_signals: qualityScore,
      age_penalty: agePenalty * 100,
    },
  }
}

async function calculateTopScore(project: ProjectMetrics): Promise<RankingResult> {
  const maturityScore = calculateMaturityScore(project)
  const ecosystemImpact = calculateEcosystemImpact(project)

  const normalizedStars = Math.log10(project.stars + 1) * 20

  const score = normalizedStars * 0.6 + maturityScore * 0.2 + ecosystemImpact * 0.2

  return {
    projectId: project.id,
    score,
    breakdown: {
      total_stars: normalizedStars,
      maturity: maturityScore,
      ecosystem_impact: ecosystemImpact,
    },
  }
}

async function saveRanking(
  projectId: number,
  rankingType: RankingFilter,
  score: number,
  position: number,
  breakdown: Record<string, number>,
): Promise<void> {
  await sql`
    INSERT INTO project_rankings (project_id, ranking_type, score, rank_position, score_breakdown)
    VALUES (${projectId}, ${rankingType}, ${score}, ${position}, ${JSON.stringify(breakdown)})
    ON CONFLICT (project_id, ranking_type) DO UPDATE SET
      score = ${score},
      rank_position = ${position},
      score_breakdown = ${JSON.stringify(breakdown)},
      computed_at = NOW()
  `
}

export async function computeAllRankings(): Promise<{
  hot: number
  trending: number
  new: number
  top: number
}> {
  const stats = { hot: 0, trending: 0, new: 0, top: 0 }

  const projects = await sql`
    SELECT 
      id, stars, forks, watchers, open_issues, contributors_count,
      total_downloads, weekly_downloads, dependents_count, release_count,
      commit_frequency, created_at, github_created_at, last_commit_at,
      last_release_at, has_readme, has_license, has_ci, has_docs
    FROM projects
    WHERE is_archived = false
    ORDER BY stars DESC
    LIMIT 1000
  `

  const hotScores: RankingResult[] = []
  const trendingScores: RankingResult[] = []
  const newScores: RankingResult[] = []
  const topScores: RankingResult[] = []

  for (const project of projects) {
    const metrics = project as ProjectMetrics

    const hotResult = await calculateHotScore(metrics)
    hotScores.push(hotResult)

    const trendingResult = await calculateTrendingScore(metrics)
    trendingScores.push(trendingResult)

    const newResult = await calculateNewScore(metrics)
    if (newResult) {
      newScores.push(newResult)
    }

    const topResult = await calculateTopScore(metrics)
    topScores.push(topResult)
  }

  hotScores.sort((a, b) => b.score - a.score)
  for (let i = 0; i < hotScores.length; i++) {
    const result = hotScores[i]
    await saveRanking(result.projectId, "hot", result.score, i + 1, result.breakdown)
    stats.hot++
  }

  trendingScores.sort((a, b) => b.score - a.score)
  for (let i = 0; i < trendingScores.length; i++) {
    const result = trendingScores[i]
    await saveRanking(result.projectId, "trending", result.score, i + 1, result.breakdown)
    stats.trending++
  }

  newScores.sort((a, b) => b.score - a.score)
  for (let i = 0; i < newScores.length; i++) {
    const result = newScores[i]
    await saveRanking(result.projectId, "new", result.score, i + 1, result.breakdown)
    stats.new++
  }

  topScores.sort((a, b) => b.score - a.score)
  for (let i = 0; i < topScores.length; i++) {
    const result = topScores[i]
    await saveRanking(result.projectId, "top", result.score, i + 1, result.breakdown)
    stats.top++
  }

  return stats
}

export async function getLastRankingComputation(): Promise<Date | null> {
  const result = await sql`
    SELECT MAX(computed_at) as last_computed FROM project_rankings
  `
  return result[0]?.last_computed ? new Date(result[0].last_computed) : null
}
