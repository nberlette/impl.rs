import { error, redirect } from "@sveltejs/kit";
import type { Cookies } from "@sveltejs/kit";
import { getUserById, verifyUserSession } from "./github-auth";
import { getAdminByEmail } from "./admin";

export async function requireAdmin(cookies: Cookies) {
  const sessionToken = cookies.get("session");
  if (!sessionToken) {
    throw redirect(303, "/auth/github");
  }

  const session = verifyUserSession(sessionToken);
  if (!session) {
    throw redirect(303, "/auth/github");
  }

  const user = await getUserById(session.id);
  if (!user) {
    throw redirect(303, "/auth/github");
  }

  if (!user.email) {
    throw error(403, "Admin access requires a verified email address.");
  }

  const admin = await getAdminByEmail(user.email);
  if (!admin) {
    throw error(403, "Admin access denied.");
  }

  return { user, admin };
}
