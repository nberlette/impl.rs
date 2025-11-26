import type { LayoutServerLoad } from "./$types"
import { verifyUserSession, getUserById } from "$lib/server/github-auth"

export const load: LayoutServerLoad = async ({ cookies }) => {
  const sessionToken = cookies.get("session")

  if (!sessionToken) {
    return { user: null }
  }

  const session = verifyUserSession(sessionToken)
  if (!session) {
    return { user: null }
  }

  const user = await getUserById(session.id)
  if (!user) {
    return { user: null }
  }

  // Don't expose the access token to the client
  return {
    user: {
      id: user.id,
      github_id: user.github_id,
      github_username: user.github_username,
      name: user.name,
      avatar_url: user.avatar_url,
      starred_projects: user.starred_projects,
    },
  }
}
