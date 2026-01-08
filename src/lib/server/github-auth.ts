import { sql } from "./db";
import type { GitHubUser, User } from "$lib/types";
import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } from "./env";
import { Buffer } from "node:buffer";

let DEFAULT_SESSION_DURATION = 7 * 24 * 60 * 60 * 1000;

export function setDefaultSessionExpiry(ttl_ms: number): void {
  ttl_ms = (ttl_ms = +ttl_ms) < 1e4 ? ttl_ms * 1e3 : ttl_ms;
  DEFAULT_SESSION_DURATION = ttl_ms;
}

export function getDefaultSessionExpiry(): number {
  return DEFAULT_SESSION_DURATION;
}

export function getGitHubAuthUrl(redirect_uri: string): string {
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri,
    scope: "read:user user:email public_repo",
    state: generateState(),
  });
  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

function generateState(): string {
  return Math.random().toString(36).substring(2, 15);
}

export async function exchangeCodeForToken(code: string): Promise<string> {
  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error_description || data.error);
  }

  return data.access_token;
}

export async function getGitHubUser(accessToken: string): Promise<GitHubUser> {
  const response = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch GitHub user");
  }

  return response.json();
}

export async function findOrCreateUser(
  githubUser: GitHubUser,
  accessToken: string,
): Promise<User> {
  // Check if user exists
  const existing = await sql`
    SELECT * FROM users WHERE github_id = ${githubUser.id}
  `;

  if (existing.length > 0) {
    // Update access token and user info
    const updated = await sql`
      UPDATE users
      SET github_access_token = ${accessToken},
          github_username = ${githubUser.login},
          name = ${githubUser.name},
          email = ${githubUser.email},
          avatar_url = ${githubUser.avatar_url},
          updated_at = NOW()
      WHERE github_id = ${githubUser.id}
      RETURNING *
    `;
    return updated[0] as User;
  }

  // Create new user
  const created = await sql`
    INSERT INTO users (
      github_id, github_username, name, email,
      avatar_url, github_access_token
    ) VALUES (
      ${githubUser.id}, ${githubUser.login}, ${githubUser.name},
      ${githubUser.email}, ${githubUser.avatar_url}, ${accessToken}
    )
    RETURNING *
  `;

  return created[0] as User;
}

export async function getUserById(id: number): Promise<User | null> {
  const result = await sql`SELECT * FROM users WHERE id = ${id}`;
  return result[0] as User | null;
}

export async function getUserStarredProjects(
  userId: number,
): Promise<number[]> {
  const result = await sql`
    SELECT starred_projects FROM users WHERE id = ${userId}
  `;
  return result[0]?.starred_projects || [];
}

export async function addStarredProject(
  userId: number,
  projectId: number,
): Promise<void> {
  await sql`
    UPDATE users
    SET starred_projects = array_append(
      array_remove(starred_projects, ${projectId}),
      ${projectId}
    ),
    updated_at = NOW()
    WHERE id = ${userId}
  `;
}

export async function removeStarredProject(
  userId: number,
  projectId: number,
): Promise<void> {
  await sql`
    UPDATE users
    SET starred_projects = array_remove(starred_projects, ${projectId}),
        updated_at = NOW()
    WHERE id = ${userId}
  `;
}

// Create a session token (simple JWT-like structure)
export function createUserSession(
  user: User,
  expireIn = DEFAULT_SESSION_DURATION,
): string {
  const payload = {
    id: user.id,
    github_id: user.github_id,
    username: user.github_username,
    exp: Date.now() + expireIn, // 7 days
  };
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

export function verifyUserSession(
  token: string,
): { id: number; github_id: number; username: string } | null {
  try {
    const payload = JSON.parse(Buffer.from(token, "base64").toString());
    if (payload.exp < Date.now()) {
      return null;
    }
    return {
      id: payload.id,
      github_id: payload.github_id,
      username: payload.username,
    };
  } catch {
    return null;
  }
}
