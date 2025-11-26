import { redirect } from "@sveltejs/kit"
import type { RequestHandler } from "./$types"
import { getGitHubAuthUrl } from "$lib/server/github-auth"

export const GET: RequestHandler = async ({ url }) => {
  const redirectUri = `${url.origin}/auth/github/callback`
  const authUrl = getGitHubAuthUrl(redirectUri)

  throw redirect(302, authUrl)
}
