import { sql } from "./db";

export async function starRepoOnGitHub(
  accessToken: string,
  owner: string,
  repo: string,
): Promise<boolean> {
  const response = await fetch(
    `https://api.github.com/user/starred/${owner}/${repo}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "impl-rs-bot",
        "Content-Length": "0",
      },
    },
  );

  return response.status === 204;
}

export async function unstarRepoOnGitHub(
  accessToken: string,
  owner: string,
  repo: string,
): Promise<boolean> {
  const response = await fetch(
    `https://api.github.com/user/starred/${owner}/${repo}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "impl-rs-bot",
      },
    },
  );

  return response.status === 204;
}

export async function checkIfStarred(
  accessToken: string,
  owner: string,
  repo: string,
): Promise<boolean> {
  const response = await fetch(
    `https://api.github.com/user/starred/${owner}/${repo}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "impl-rs-bot",
      },
    },
  );

  return response.status === 204;
}

export async function getUserAccessToken(
  userId: number,
): Promise<string | null> {
  const result = await sql`
    SELECT github_access_token FROM users WHERE id = ${userId}
  `;
  return result[0]?.github_access_token || null;
}
