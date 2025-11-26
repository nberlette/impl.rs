<script lang="ts">
  import type { PageData } from "./$types";
  import Card from "$lib/components/ui/card.svelte";
  import Button from "$lib/components/ui/button.svelte";
  import Badge from "$lib/components/ui/badge.svelte";
  import { formatNumber, timeAgo } from "$lib/utils";
  import {
    Package,
    Inbox,
    RefreshCw,
    Users,
    TrendingUp,
    Calendar,
    ArrowRight,
    CheckCircle,
    XCircle,
    Clock
  } from "lucide-svelte";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const statCards = $derived([
    {
      label: "Total Projects",
      value: formatNumber(data.stats.totalProjects),
      icon: Package,
      color: "text-primary"
    },
    {
      label: "Pending Submissions",
      value: formatNumber(data.stats.pendingSubmissions),
      icon: Inbox,
      color: "text-warning",
      href: "/admin/submissions"
    },
    {
      label: "Added This Week",
      value: formatNumber(data.stats.projectsThisWeek),
      icon: TrendingUp,
      color: "text-success"
    },
    {
      label: "Added This Month",
      value: formatNumber(data.stats.projectsThisMonth),
      icon: Calendar,
      color: "text-primary"
    }
  ]);
</script>

<div class="space-y-6">
  <div>
    <h2 class="text-2xl font-bold">Dashboard</h2>
    <p class="text-muted-foreground">Overview of your impl.rs platform</p>
  </div>

  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {#each statCards as stat}
      <Card class="p-5">
        {#if stat.href}
          <a href={stat.href} class="block">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-muted-foreground">
                {stat.label}
              </span>
              <stat.icon class="h-4 w-4 {stat.color}" />
            </div>
            <p class="mt-2 text-3xl font-bold">{stat.value}</p>
          </a>
        {:else}
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-muted-foreground">
              {stat.label}
            </span>
            <stat.icon class="h-4 w-4 {stat.color}" />
          </div>
          <p class="mt-2 text-3xl font-bold">{stat.value}</p>
        {/if}
      </Card>
    {/each}
  </div>

  <div class="grid gap-6 lg:grid-cols-2">
    <Card class="p-5">
      <div class="mb-4 flex items-center justify-between">
        <h3 class="font-semibold">Pending Submissions</h3>
        <Button variant="ghost" size="sm" href="/admin/submissions">
          View all
          <ArrowRight class="ml-1 h-4 w-4" />
        </Button>
      </div>

      {#if data.pendingSubmissions.length > 0}
        <ul class="space-y-3">
          {#each data.pendingSubmissions as submission}
            <li class="flex items-center justify-between rounded-md border p-3">
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium">
                  {submission.github_url.replace("https://github.com/", "")}
                </p>
                <p class="text-xs text-muted-foreground">
                  {timeAgo(submission.created_at)}
                </p>
              </div>
              <Badge variant="outline" class="ml-2">
                <Clock class="mr-1 h-3 w-3" />
                Pending
              </Badge>
            </li>
          {/each}
        </ul>
      {:else}
        <p class="text-center text-sm text-muted-foreground py-6">
          No pending submissions
        </p>
      {/if}
    </Card>

    <Card class="p-5">
      <div class="mb-4 flex items-center justify-between">
        <h3 class="font-semibold">Recent Syncs</h3>
        <Button variant="ghost" size="sm" href="/admin/sync">
          View all
          <ArrowRight class="ml-1 h-4 w-4" />
        </Button>
      </div>

      {#if data.recentSyncs.length > 0}
        <ul class="space-y-3">
          {#each data.recentSyncs as sync}
            <li class="flex items-center justify-between rounded-md border p-3">
              <div>
                <p class="text-sm font-medium capitalize">{sync.sync_type}</p>
                <p class="text-xs text-muted-foreground">
                  +{sync.projects_added} added, {sync.projects_updated} updated
                </p>
              </div>
              <Badge
                variant={sync.status === "completed" ? "default" : "destructive"}
              >
                {#if sync.status === "completed"}
                  <CheckCircle class="mr-1 h-3 w-3" />
                {:else}
                  <XCircle class="mr-1 h-3 w-3" />
                {/if}
                {sync.status}
              </Badge>
            </li>
          {/each}
        </ul>
      {:else}
        <p class="text-center text-sm text-muted-foreground py-6">
          No sync logs yet
        </p>
      {/if}
    </Card>
  </div>

  <Card class="p-5">
    <h3 class="mb-4 font-semibold">Quick Actions</h3>
    <div class="flex flex-wrap gap-3">
      <Button href="/admin/sync">
        <RefreshCw class="h-4 w-4" />
        Trigger Sync
      </Button>
      <Button variant="outline" href="/admin/projects">
        <Package class="h-4 w-4" />
        Manage Projects
      </Button>
      <Button variant="outline" href="/admin/submissions">
        <Inbox class="h-4 w-4" />
        Review Submissions
      </Button>
    </div>
  </Card>
</div>
