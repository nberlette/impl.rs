import { redirect } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

// redirect /project requests without a project slug to the site root
export const load: PageLoad = ({ url }) => {
  throw redirect(308, `/${url.search}`);
};
