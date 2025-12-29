const ADMIN_SESSION_KEY = "admin_session";

export function createSessionToken(adminId: number, email: string): string {
  const payload = {
    id: adminId,
    email,
    exp: Date.now() + 24 * 60 * 60 * 1000,
  };
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

export function verifySessionToken(
  token: string,
): { id: number; email: string } | null {
  try {
    const payload = JSON.parse(Buffer.from(token, "base64").toString());
    if (payload.exp < Date.now()) {
      return null;
    }
    return { id: payload.id, email: payload.email };
  } catch {
    return null;
  }
}

export function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}
