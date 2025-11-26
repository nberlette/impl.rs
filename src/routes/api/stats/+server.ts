import { json } from "@sveltejs/kit"
import type { RequestHandler } from "./$types"
import { getProjectStats } from "$lib/server/projects"
import { getLastRankingComputation } from "$lib/server/rankings"

export const GET: RequestHandler = async () => {
  try {
    const [stats, lastRanking] = await Promise.all([getProjectStats(), getLastRankingComputation()])

    return json({
      ...stats,
      lastRankingUpdate: lastRanking?.toISOString() || null,
    })
  } catch (error) {
    console.error("Stats API error:", error)
    return json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
