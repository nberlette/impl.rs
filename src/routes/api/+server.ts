import { error } from "@sveltejs/kit";

export const GET = ({ request }) => {
  throw error(500);
};
