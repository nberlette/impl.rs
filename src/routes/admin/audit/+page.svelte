<script lang="ts">
  import type { PageData } from "./$types";
  import Card from "$lib/components/ui/card.svelte";
  import Badge from "$lib/components/ui/badge.svelte";
  import Button from "$lib/components/ui/button.svelte";
  import Input from "$lib/components/ui/input.svelte";
  import { page } from "$app/state";
  import { formatDate, timeAgo } from "$lib/utils";
  import { History, User } from "lucide-svelte";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const exportParams = $derived.by(() => {
    const params = new URLSearchParams(page.url.searchParams);
    params.delete("export");
    return params.toString();
  });

  const actionColors: Record<string, string> = {
    create: "default",
    update: "secondary",
    delete: "destructive",
    approve: "default",
    reject: "destructive",
  };

  let current = $derived(data.current);

  export const snapshot = {
    capture: () => current,
    restore(snapshot) {
      current = data.current = { ...current, ...snapshot };
    },
  };
</script>

<div>
  <Card class="p-4">
    <form method="GET" class="grid gap-3 md:grid-cols-6">
      <div class="md:col-span-2">
        <label for="filter_query" class="text-xs font-medium text-foreground/70"
        >Search</label>
        <Input
          name="q"
          id="filter_query"
          bind:value={current.q}
          placeholder="Action, entity, admin, id"
        />
      </div>
      <div>
        <label
          for="filter_action"
          class="text-xs font-medium text-foreground/70"
        >Action</label>
        <select
          id="filter_action"
          name="action"
          class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          bind:value={current.action}
        >
          <option value="">All</option>
          {#each data.filters.actions as action}
            <option value={action} selected={action === current.action}>
              {action}
            </option>
          {/each}
        </select>
      </div>
      <div>
        <label
          for="filter_entity_type"
          class="text-xs font-medium text-foreground/70"
        >Entity</label>
        <select
          id="filter_entity_type"
          name="entityType"
          class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          bind:value={current.entityType}
        >
          <option value="">All</option>
          {#each data.filters.entityTypes as entityType}
            <option
              value={entityType}
              selected={entityType === current.entityType}
            >
              {entityType}
            </option>
          {/each}
        </select>
      </div>
      <div>
        <label
          for="filter_admin_name"
          class="text-xs font-medium text-foreground/70"
        >Admin</label>
        <select
          name="admin"
          id="filter_admin_name"
          class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          bind:value={current.admin}
        >
          <option value="">All</option>
          {#each data.filters.adminNames as adminName}
            <option value={adminName} selected={adminName === current.admin}>
              {adminName}
            </option>
          {/each}
        </select>
      </div>
      <div>
        <label for="date_start" class="text-xs font-medium text-foreground/70"
        >Start Date</label>
        <Input
          id="date_start"
          name="from"
          type="date"
          bind:value={current.from}
        />
      </div>
      <div>
        <label for="date_end" class="text-xs font-medium text-foreground/70"
        >End Date</label>
        <Input id="date_end" name="to" type="date" bind:value={current.to} />
      </div>
      <div class="md:col-span-6 flex flex-wrap gap-2">
        <Button type="submit" variant="outline">Apply</Button>
        <Button type="reset" variant="ghost">Reset</Button>
        <div class="ml-auto flex flex-wrap gap-2">
          <Button
            variant="outline"
            href={`/admin/audit/export.csv?${exportParams}`}
            class="cursor-copy"
            size="sm"
          >
            Export CSV
          </Button>
          <Button
            variant="outline"
            href={`/admin/audit/export.json?${exportParams}`}
            cursor="cursor-copy"
            size="sm"
          >
            Export JSON
          </Button>
          <Button
            variant="outline"
            href={`/admin/audit/export.yml?${exportParams}`}
            cursor="cursor-copy"
            size="sm"
          >
            Export YAML
          </Button>
        </div>
      </div>
    </form>
  </Card>

  {#if data.auditLogs.length > 0}
    <Card>
      <div class="divide-y">
        {#each data.auditLogs as log}
          <div class="flex items-start gap-4 p-4">
            <div
              class="
                flex size-10 shrink-0 items-center justify-center
                rounded-full bg-secondary
              "
            >
              <History class="size-5 text-muted-foreground" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <Badge
                  variant={actionColors[log.action.split("_")[0]] as never ||
                    "secondary"}
                >
                  {log.action}
                </Badge>
                <span class="text-sm text-foreground/70">
                  on <strong><kbd>{log.entity_type}</kbd> <code>#{
                        log.entity_id
                      }</code></strong>
                </span>
              </div>
              <div
                class="mt-1 flex items-center gap-2 text-xs text-foreground/60"
              >
                {#if log.admin_name}
                  <span class="flex items-center gap-1">
                    <User class="size-3" />
                    {log.admin_name}
                  </span>
                {/if}
                <span>{timeAgo(log.created_at)}</span>
              </div>
              {#if             log.metadata && Object.keys(log.metadata).length > 0}
                <pre
                  class="mt-2 overflow-x-auto rounded bg-muted p-2 text-xs"
                >{JSON.stringify(log.metadata, null, 2).split(/\n  |\n/g).slice(1, -1).join("\n")}</pre>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </Card>
  {:else}
    <Card class="p-12 text-center">
      <History class="mx-auto mb-4 size-8 text-foreground/60" />
      <p class="text-foreground/70">No audit logs yet</p>
    </Card>
  {/if}
</div>
