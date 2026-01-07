import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = ({ request, data }) => {
  // if (!data?.user) throw redirect(401, "/");
};
