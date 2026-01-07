import { CRON_SECRET } from "./env";

export function isCronAuthorized(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  const vercelCron = request.headers.get("x-vercel-cron");

  if (!CRON_SECRET) return true;
  if (authHeader === `Bearer ${CRON_SECRET}`) return true;
  return vercelCron === "1";
}
