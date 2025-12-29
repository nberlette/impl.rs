import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import {
  createUserSession,
  exchangeCodeForToken,
  findOrCreateUser,
  getGitHubUser,
} from "$lib/server/github-auth";
import { NODE_ENV } from "$lib/server/env";

export const GET: RequestHandler = async ({ url, cookies }) => {
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    throw redirect(302, "/?error=auth_denied");
  }

  if (!code) {
    throw redirect(302, "/?error=no_code");
  }

  try {
    const accessToken = await exchangeCodeForToken(code);
    const githubUser = await getGitHubUser(accessToken);
    const user = await findOrCreateUser(githubUser, accessToken);
    const sessionToken = createUserSession(user);

    cookies.set("session", sessionToken, {
      path: "/",
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    throw redirect(302, "/?success=logged_in");
  } catch (err) {
    console.error("GitHub auth error:", err);
    throw redirect(302, "/?error=auth_failed");
  }
};
