<script lang="ts">
  import type { PageData } from "./$types";
  import Card from "$lib/components/ui/card.svelte";
  import Button from "$lib/components/ui/button.svelte";
  import Badge from "$lib/components/ui/badge.svelte";
  import Tabs from "$lib/components/ui/tabs.svelte";
  import { formatDate, timeAgo } from "$lib/utils";
  import { enhance } from "$app/forms";
  import {
    CheckCircle,
    XCircle,
    Clock,
    ExternalLink,
    Github
  } from "lucide-svelte";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
  let statusFilter = $state("pending");

  const tabs = [
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "all", label: "All" }
  ];

  let filteredSubmissions = $derived(
    statusFilter === "all"
      ? data.submissions
      : data.submissions.filter((s) => s.status === statusFilter)
  );

  const statusIcons = {
    pending: Clock,
    approved: CheckCircle,
    rejected: XCircle
  };

  const statusVariants = {
    pending: "outline" as const,
    approved: "default" as const,
    rejected: "destructive" as const
  };
</script>

<div class="space-y-6">
  <div>
    <h2 class="text-2xl font-bold">Submissions</h2>
    <p class="text-muted-foreground">
      Review and moderate user-submitted projects
    </p>
  </div>

  <Tabs
    {tabs}
    value={statusFilter}
    onchange={(v) => (statusFilter = v)}
    class="w-full sm:w-auto"
  />

  {#if filteredSubmissions.length > 0}
    <div class="space-y-4">
      {#each filteredSubmissions as submission}
        <Card class="p-5">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-start 
                      sm:justify-between">
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <Github class="h-4 w-4 text-muted-foreground" />
                <a
                  href={submission.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="truncate font-medium hover:text-primary"
                >
                  {submission.github_url.replace("https://github.com/", "")}
                </a>
                <a
                  href={submission.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-muted-foreground hover:text-foreground"
                  aria-label="Open in new tab"
                >
                  <ExternalLink class="h-4 w-4" />
                </a>
              </div>

              {#if submission.reason}
                <p class="mt-2 text-sm text-muted-foreground">
                  "{submission.reason}"
                </p>
              {/if}

              <div
                class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 
                       text-xs text-muted-foreground"
              >
                {#if submission.submitted_by_name}
                  <span>By: {submission.submitted_by_name}</span>
                {/if}
                {#if submission.submitted_by_email}
                  <span>{submission.submitted_by_email}</span>
                {/if}
                <span>Submitted {timeAgo(submission.created_at)}</span>
              </div>

              {#if submission.review_notes}
                <p
                  class="mt-2 rounded-md bg-muted p-2 text-xs 
                         text-muted-foreground"
                >
                  Note: {submission.review_notes}
                </p>
              {/if}
            </div>

            <div class="flex items-center gap-2">
              <Badge variant={statusVariants[submission.status]}>
                {@const SvelteComponent = statusIcons[submission.status]}
                <SvelteComponent
                  class="mr-1 h-3 w-3"
                />
                {submission.status}
              </Badge>

              {#if submission.status === "pending"}
                <form method="POST" action="?/approve" use:enhance class="inline">
                  <input type="hidden" name="id" value={submission.id} />
                  <Button size="sm" type="submit">
                    <CheckCircle class="h-4 w-4" />
                    Approve
                  </Button>
                </form>
                <form method="POST" action="?/reject" use:enhance class="inline">
                  <input type="hidden" name="id" value={submission.id} />
                  <Button variant="outline" size="sm" type="submit">
                    <XCircle class="h-4 w-4" />
                    Reject
                  </Button>
                </form>
              {/if}
            </div>
          </div>
        </Card>
      {/each}
    </div>
  {:else}
    <Card class="p-12 text-center">
      <p class="text-muted-foreground">
        No {statusFilter === "all" ? "" : statusFilter} submissions found
      </p>
    </Card>
  {/if}
</div>
