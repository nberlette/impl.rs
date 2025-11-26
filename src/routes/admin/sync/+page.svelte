<script lang="ts">
  import type { PageData, ActionData } from "./$types";
  import Card from "$lib/components/ui/card.svelte";
  import Button from "$lib/components/ui/button.svelte";
  import Badge from "$lib/components/ui/badge.svelte";
  import { formatDate, timeAgo } from "$lib/utils";
  import { enhance } from "$app/forms";
  import {
    RefreshCw,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    TrendingUp
  } from "lucide-svelte";

  interface Props {
    data: PageData;
    form: ActionData;
  }

  let { data, form }: Props = $props();
  let syncing = $state(false);
  let computingRankings = $state(false);

  const statusConfig = {
    completed: { icon: CheckCircle, variant: "default" as const, color: "text-success" },
    failed: { icon: XCircle, variant: "destructive" as const, color: "text-destructive" },
    pending: { icon: Clock, variant: "outline" as const, color: "text-warning" },
    running: { icon: RefreshCw, variant: "secondary" as const, color: "text-primary" }
  };

  async function triggerRankings() {
    computingRankings = true;
    try {
      const res = await fetch("/api/cron/rankings", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        alert(`Rankings computed: ${data.totalRankings} total rankings updated`);
      }
    } catch (err) {
      console.error("Rankings error:", err);
    } finally {
      computingRankings = false;
    }
  }
</script>

<div class="space-y-6">
  <div class="flex flex-col gap-4 sm:flex-row sm:items-center 
              sm:justify-between">
    <div>
      <h2 class="text-2xl font-bold">Sync & Logs</h2>
      <p class="text-muted-foreground">
        Manage GitHub synchronization and view sync history
      </p>
    </div>
    <div class="flex gap-2">
      <form
        method="POST"
        action="?/triggerSync"
        use:enhance={() => {
          syncing = true;
          return async ({ update }) => {
            await update();
            syncing = false;
          };
        }}
      >
        <Button type="submit" disabled={syncing}>
          <RefreshCw class="h-4 w-4 {syncing ? 'animate-spin' : ''}" />
          {syncing ? "Syncing..." : "Sync Data"}
        </Button>
      </form>
      <Button 
        variant="outline" 
        onclick={triggerRankings} 
        disabled={computingRankings}
      >
        <TrendingUp class="h-4 w-4 {computingRankings ? 'animate-pulse' : ''}" />
        {computingRankings ? "Computing..." : "Compute Rankings"}
      </Button>
    </div>
  </div>

  {#if form?.success}
    <Card class="border-success/50 bg-success/10 p-4">
      <div class="flex items-center gap-2 text-success">
        <CheckCircle class="h-5 w-5" />
        <span>{form.message}</span>
      </div>
    </Card>
  {/if}

  <Card class="p-5">
    <h3 class="mb-4 font-semibold">How Sync Works</h3>
    <ul class="space-y-2 text-sm text-muted-foreground">
      <li class="flex items-start gap-2">
        <span class="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary"></span>
        <span>
          Automatic syncs run every 6 hours via Vercel Cron
        </span>
      </li>
      <li class="flex items-start gap-2">
        <span class="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary"></span>
        <span>
          GitHub API searches for Rust projects sorted by stars and recent activity
        </span>
      </li>
      <li class="flex items-start gap-2">
        <span class="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary"></span>
        <span>
          crates.io data is fetched for projects with published crates
        </span>
      </li>
      <li class="flex items-start gap-2">
        <span class="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary"></span>
        <span>
          Rankings are recalculated 30 minutes after each data sync
        </span>
      </li>
    </ul>
  </Card>

  <Card class="p-5">
    <h3 class="mb-4 font-semibold">Ranking Algorithms</h3>
    <div class="grid gap-4 sm:grid-cols-2">
      <div class="rounded-lg border p-3">
        <p class="font-medium text-primary">Hot (50/30/20)</p>
        <p class="text-xs text-muted-foreground">
          Star velocity + Activity score + Community engagement
        </p>
      </div>
      <div class="rounded-lg border p-3">
        <p class="font-medium text-primary">Trending (40/30/30)</p>
        <p class="text-xs text-muted-foreground">
          Growth rate + Acceleration + Release activity
        </p>
      </div>
      <div class="rounded-lg border p-3">
        <p class="font-medium text-primary">New (50/50)</p>
        <p class="text-xs text-muted-foreground">
          Initial traction + Quality signals (repos &lt;90 days)
        </p>
      </div>
      <div class="rounded-lg border p-3">
        <p class="font-medium text-primary">Top (60/20/20)</p>
        <p class="text-xs text-muted-foreground">
          Total stars + Maturity + Ecosystem impact
        </p>
      </div>
    </div>
  </Card>

  <Card>
    <div class="border-b p-4">
      <h3 class="font-semibold">Sync History</h3>
    </div>
    {#if data.syncLogs.length > 0}
      <div class="divide-y">
        {#each data.syncLogs as log}
          {@const config = statusConfig[log.status as keyof typeof statusConfig] || statusConfig.pending}
          <div class="flex flex-col gap-2 p-4 sm:flex-row sm:items-center 
                      sm:justify-between">
            <div class="flex items-center gap-3">
              <config.icon class="h-5 w-5 {config.color}" />
              <div>
                <p class="font-medium capitalize">{log.sync_type} Sync</p>
                <p class="text-xs text-muted-foreground">
                  {timeAgo(log.started_at)}
                  {#if log.completed_at}
                    - Completed in {Math.round(
                      (new Date(log.completed_at).getTime() -
                        new Date(log.started_at).getTime()) /
                        1000
                    )}s
                  {/if}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-sm text-muted-foreground">
                +{log.projects_added} added, {log.projects_updated} updated
                {#if log.errors_count > 0}
                  , {log.errors_count} errors
                {/if}
              </span>
              <Badge variant={config.variant}>
                {log.status}
              </Badge>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <div class="p-12 text-center">
        <RefreshCw class="mx-auto mb-4 h-8 w-8 text-muted-foreground" />
        <p class="text-muted-foreground">No sync logs yet</p>
      </div>
    {/if}
  </Card>
</div>
