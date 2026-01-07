<script lang="ts">
  import type { ActionData, PageData } from "./$types";
  import Card from "$lib/components/ui/card.svelte";
  import Button from "$lib/components/ui/button.svelte";
  import Badge from "$lib/components/ui/badge.svelte";
  import { formatDate, timeAgo } from "$lib/utils";
  import { enhance } from "$app/forms";
  import {
    AlertCircle,
    CheckCircle,
    Clock,
    RefreshCw,
    TrendingUp,
    XCircle,
  } from "lucide-svelte";

  interface Props {
    data: PageData;
    form: ActionData;
  }

  let { data, form }: Props = $props();
  let syncing = $state(false);
  let computingRankings = $state(false);

  const statusConfig = {
    completed: {
      icon: CheckCircle,
      variant: "default" as const,
      color: "text-success",
    },
    failed: {
      icon: XCircle,
      variant: "destructive" as const,
      color: "text-destructive",
    },
    pending: {
      icon: Clock,
      variant: "outline" as const,
      color: "text-warning",
    },
    running: {
      icon: RefreshCw,
      variant: "secondary" as const,
      color: "text-primary",
    },
    cancelled: {
      icon: AlertCircle,
      variant: "outline" as const,
      color: "text-foreground/70",
    },
  };
</script>

<div class="space-y-6">
  <div class="flex flex-wrap justify-end gap-2">
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
        <RefreshCw class="size-4 {syncing ? 'animate-spin' : ''}" />
        {syncing ? "Syncing..." : "Sync Data"}
      </Button>
    </form>
    <form
      method="POST"
      action="?/computeRankings"
      use:enhance={() => {
        computingRankings = true;
        return async ({ update }) => {
          await update();
          computingRankings = false;
        };
      }}
    >
      <Button
        variant="outline"
        type="submit"
        disabled={computingRankings}
      >
        <TrendingUp
          class="size-4 {computingRankings ? 'animate-pulse' : ''}"
        />
        {computingRankings ? "Computing..." : "Compute Rankings"}
      </Button>
    </form>
  </div>

  {#if form?.success}
    <Card class="border-success/50 bg-success/10 p-4">
      <div class="flex items-center gap-2 text-success">
        <CheckCircle class="size-5" />
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
          GitHub API searches for Rust projects sorted by stars and recent
          activity
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
          {@const         config =
          statusConfig[log.status as keyof typeof statusConfig] ||
          statusConfig.pending}
          <div
            class="
              flex flex-col gap-2 p-4 sm:flex-row sm:items-center
              sm:justify-between
            "
          >
            <div class="flex items-center gap-3">
              <config.icon class="size-5 {config.color}" />
              <div>
                <p class="font-medium capitalize">{log.sync_type} Sync</p>
                <p class="text-xs text-muted-foreground">
                  {timeAgo(log.started_at)}
                  {#if log.completed_at}
                    - Completed in {
                      Math.round(
                        (new Date(log.completed_at).getTime() -
                          new Date(log.started_at).getTime()) /
                          1000,
                      )
                    }s
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
              {#if             log.status === "running" || log.status === "pending"}
                <form method="POST" action="?/cancelSync">
                  <input type="hidden" name="id" value={log.id} />
                  <Button type="submit" size="sm" variant="outline">
                    Cancel
                  </Button>
                </form>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <div class="p-12 text-center">
        <RefreshCw class="mx-auto mb-4 size-8 text-muted-foreground" />
        <p class="text-muted-foreground">No sync logs yet</p>
      </div>
    {/if}
  </Card>

  <Card class="p-5">
    <h3 class="mb-4 font-semibold">Maintenance</h3>
    <form
      method="POST"
      action="?/purgeLogs"
      class="flex flex-col gap-3 sm:flex-row sm:items-end"
    >
      <label class="flex flex-col gap-1 text-sm">
        <span class="text-foreground/80">Status</span>
        <select
          name="status"
          class="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="failed">Failed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </label>
      <label class="flex flex-col gap-1 text-sm">
        <span class="text-foreground/80">Older than (days)</span>
        <input
          name="days"
          type="number"
          min="0"
          value="30"
          class="h-10 w-28 rounded-md border border-input bg-background px-3 text-sm"
        />
      </label>
      <Button type="submit" variant="outline">
        Remove Logs
      </Button>
    </form>
    <p class="mt-3 text-xs text-muted-foreground">
      Purged entries are still captured in audit logs for accountability.
    </p>
  </Card>
</div>
