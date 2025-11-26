<script lang="ts">
  import type { PageData } from "./$types";
  import Card from "$lib/components/ui/card.svelte";
  import Badge from "$lib/components/ui/badge.svelte";
  import { formatDate, timeAgo } from "$lib/utils";
  import { History, User } from "lucide-svelte";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const actionColors: Record<string, string> = {
    create: "default",
    update: "secondary",
    delete: "destructive",
    approve: "default",
    reject: "destructive"
  };
</script>

<div class="space-y-6">
  <div>
    <h2 class="text-2xl font-bold">Audit Log</h2>
    <p class="text-muted-foreground">Track all administrative actions</p>
  </div>

  {#if data.auditLogs.length > 0}
    <Card>
      <div class="divide-y">
        {#each data.auditLogs as log}
          <div class="flex items-start gap-4 p-4">
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center 
                     rounded-full bg-secondary"
            >
              <History class="h-5 w-5 text-muted-foreground" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <Badge
                  variant={actionColors[log.action.split("_")[0]] as
                    | "default"
                    | "secondary"
                    | "destructive"
                    | "outline" || "secondary"}
                >
                  {log.action}
                </Badge>
                <span class="text-sm text-muted-foreground">
                  on {log.entity_type} #{log.entity_id}
                </span>
              </div>
              <div class="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                {#if log.admin_name}
                  <span class="flex items-center gap-1">
                    <User class="h-3 w-3" />
                    {log.admin_name}
                  </span>
                {/if}
                <span>{timeAgo(log.created_at)}</span>
              </div>
              {#if log.metadata && Object.keys(log.metadata).length > 0}
                <pre
                  class="mt-2 overflow-x-auto rounded bg-muted p-2 text-xs"
                >{JSON.stringify(log.metadata, null, 2)}</pre>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </Card>
  {:else}
    <Card class="p-12 text-center">
      <History class="mx-auto mb-4 h-8 w-8 text-muted-foreground" />
      <p class="text-muted-foreground">No audit logs yet</p>
    </Card>
  {/if}
</div>
