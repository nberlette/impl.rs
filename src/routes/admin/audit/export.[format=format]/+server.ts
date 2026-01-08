import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { requireAdmin } from "$lib/server/admin-auth";
import { searchAuditLogs } from "$lib/server/admin";
import * as YAML from "@std/yaml";
import * as CSV from "@std/csv";
import * as TOML from "@std/toml";

const columns = [
  "id",
  "admin_user_id",
  "admin_name",
  "action",
  "entity_type",
  "entity_id",
  "created_at",
  "ip_address",
  "metadata",
];

export const GET: RequestHandler = async ({ params, cookies, url }) => {
  await requireAdmin(cookies);

  const format = params.format.toLowerCase();
  const compact = url.searchParams.get("compact") !== null;
  const query = url.searchParams.get("q");
  const action = url.searchParams.get("action");
  const entityType = url.searchParams.get("entityType");
  const adminName = url.searchParams.get("admin");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const limit = +(url.searchParams.get("limit") ?? 5e3) | 0;
  const inline = url.searchParams.get("inline") !== null;

  const auditLogs = await searchAuditLogs({
    limit,
    query,
    action,
    entityType,
    adminName,
    from,
    to,
  });

  let data = "", mime = "application/json", ext = format;
  switch (format) {
    case "csv":
      data = CSV.stringify(auditLogs, { bom: true, columns, headers: true });
      mime = "text/csv";
      break;
    case "yaml":
    case "yml":
      data = YAML.stringify(auditLogs, {
        arrayIndent: !compact,
        condenseFlow: compact,
        skipInvalid: true,
        flowLevel: compact ? 0 : -1,
        lineWidth: compact ? Infinity : 100,
      });
      ext = "yml";
      mime = "text/yaml";
      break;
    case "toml":
      data = TOML.stringify({ logs: auditLogs }, { keyAlignment: !compact });
      mime = "text/toml";
      break;
    default:
      ext = "json";
      data = JSON.stringify(auditLogs, null, compact ? 0 : 2);
      break;
  }

  const headers = new Headers({ "content-type": mime + "; charset=utf-8" });
  headers.append("content-length", data.length.toString());
  headers.append("cache-control", "private, no-cache, no-store");

  let filename = "implrs_";
  if (action) {
    headers.append("x-audit-action", action);
    filename += "_" + action;
  }
  // add entity type (e.g. project, site_setting, etc) to headers
  if (entityType) {
    headers.append("x-audit-entity", entityType);
    // filename += "_" + entityType;
  }
  // add dates to filename and headers if present
  if (from) {
    headers.append("x-audit-start-date", from);
    filename += "__" + from.trim().replace(/[^\w_-]+/g, "-");
  }
  if (to) {
    headers.append("x-audit-end-date", to);
    filename += from ? "_-_" : "__";
    filename += to.trim().replace(/[^\w_-]+/g, "-");
  }
  filename = filename.replace(/_+$/, "") + ".audit";
  // append admin name filter to headers and filename if present
  if (adminName) {
    headers.append("x-audit-admin", adminName);
    filename += "@" + adminName;
  }
  filename += "." + ext;
  const disposition = inline ? "inline" : "attachment";
  headers.append(
    "content-disposition",
    `${disposition}; filename="${filename}"`,
  );

  if (query) headers.append("x-audit-query", query);

  return new Response(data, { headers });
};
