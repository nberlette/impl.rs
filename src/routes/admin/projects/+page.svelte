<script lang="ts">
  import type { PageData } from "./$types";
  import Card from "$lib/components/ui/card.svelte";
  import Button from "$lib/components/ui/button.svelte";
  import Badge from "$lib/components/ui/badge.svelte";
  import Input from "$lib/components/ui/input.svelte";
  import { formatNumber, timeAgo } from "$lib/utils";
  import { enhance } from "$app/forms";
  import {
    Star,
    GitFork,
    ExternalLink,
    Trash2,
    Award,
    Archive,
    Search,
    ChevronLeft,
    ChevronRight
  } from "lucide-svelte";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
  let searchQuery = $state("");

  let filteredProjects = $derived(
    searchQuery
      ? data.projects.filter(
          (p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : data.projects
  );
</script>

<div class="space-y-6">
  <div class="flex flex-col gap-4 sm:flex-row sm:items-center 
              sm:justify-between">
    <div>
      <h2 class="text-2xl font-bold">Projects</h2>
      <p class="text-muted-foreground">
        Manage {data.total} projects in the database
      </p>
    </div>
  </div>

  <Card class="p-4">
    <div class="relative">
      <Search
        class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 
               text-muted-foreground"
      />
      <Input
        type="search"
        placeholder="Filter projects..."
        bind:value={searchQuery}
        class="pl-10"
      />
    </div>
  </Card>

  <Card>
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="border-b text-left text-sm text-muted-foreground">
            <th class="p-4 font-medium">Project</th>
            <th class="p-4 font-medium">Stats</th>
            <th class="p-4 font-medium">Status</th>
            <th class="p-4 font-medium">Updated</th>
            <th class="p-4 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each filteredProjects as project}
            <tr class="border-b last:border-0 hover:bg-muted/50">
              <td class="p-4">
                <div class="flex items-center gap-3">
                  {#if project.avatar_url}
                    <img
                      src={project.avatar_url || "/placeholder.svg"}
                      alt=""
                      class="h-10 w-10 rounded-lg bg-muted object-cover"
                    />
                  {:else}
                    <div
                      class="flex h-10 w-10 items-center justify-center 
                             rounded-lg bg-primary/10 text-primary"
                    >
                      <span class="font-bold">
                        {project.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  {/if}
                  <div class="min-w-0">
                    <p class="truncate font-medium">{project.name}</p>
                    <p class="truncate text-xs text-muted-foreground">
                      {project.repository_owner}/{project.repository_name}
                    </p>
                  </div>
                </div>
              </td>
              <td class="p-4">
                <div class="flex items-center gap-3 text-sm">
                  <span class="flex items-center gap-1">
                    <Star class="h-4 w-4 text-muted-foreground" />
                    {formatNumber(project.stars)}
                  </span>
                  <span class="flex items-center gap-1">
                    <GitFork class="h-4 w-4 text-muted-foreground" />
                    {formatNumber(project.forks)}
                  </span>
                </div>
              </td>
              <td class="p-4">
                <div class="flex flex-wrap gap-1">
                  {#if project.is_featured}
                    <Badge variant="default" class="text-xs">Featured</Badge>
                  {/if}
                  {#if project.is_archived}
                    <Badge variant="secondary" class="text-xs">Archived</Badge>
                  {/if}
                  {#if project.is_user_submitted}
                    <Badge variant="outline" class="text-xs">Community</Badge>
                  {/if}
                </div>
              </td>
              <td class="p-4 text-sm text-muted-foreground">
                {timeAgo(project.updated_at)}
              </td>
              <td class="p-4">
                <div class="flex items-center gap-1">
                  <a
                    href={project.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="rounded-md p-2 text-muted-foreground 
                           hover:bg-secondary hover:text-foreground"
                    aria-label="View on GitHub"
                  >
                    <ExternalLink class="h-4 w-4" />
                  </a>

                  <form method="POST" action="?/toggleFeatured" use:enhance>
                    <input type="hidden" name="id" value={project.id} />
                    <input
                      type="hidden"
                      name="is_featured"
                      value={project.is_featured}
                    />
                    <button
                      type="submit"
                      class="rounded-md p-2 text-muted-foreground 
                             hover:bg-secondary hover:text-foreground"
                      aria-label={project.is_featured
                        ? "Remove from featured"
                        : "Add to featured"}
                      title={project.is_featured
                        ? "Remove from featured"
                        : "Add to featured"}
                    >
                      <Award
                        class="h-4 w-4 {project.is_featured
                          ? 'text-primary'
                          : ''}"
                      />
                    </button>
                  </form>

                  <form method="POST" action="?/toggleArchived" use:enhance>
                    <input type="hidden" name="id" value={project.id} />
                    <input
                      type="hidden"
                      name="is_archived"
                      value={project.is_archived}
                    />
                    <button
                      type="submit"
                      class="rounded-md p-2 text-muted-foreground 
                             hover:bg-secondary hover:text-foreground"
                      aria-label={project.is_archived ? "Unarchive" : "Archive"}
                      title={project.is_archived ? "Unarchive" : "Archive"}
                    >
                      <Archive
                        class="h-4 w-4 {project.is_archived
                          ? 'text-warning'
                          : ''}"
                      />
                    </button>
                  </form>

                  <form method="POST" action="?/delete" use:enhance>
                    <input type="hidden" name="id" value={project.id} />
                    <button
                      type="submit"
                      class="rounded-md p-2 text-muted-foreground 
                             hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Delete project"
                      title="Delete project"
                    >
                      <Trash2 class="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    {#if data.totalPages > 1}
      <div class="flex items-center justify-between border-t p-4">
        <p class="text-sm text-muted-foreground">
          Page {data.page} of {data.totalPages}
        </p>
        <div class="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            href="/admin/projects?page={data.page - 1}"
            disabled={data.page <= 1}
          >
            <ChevronLeft class="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            href="/admin/projects?page={data.page + 1}"
            disabled={data.page >= data.totalPages}
          >
            Next
            <ChevronRight class="h-4 w-4" />
          </Button>
        </div>
      </div>
    {/if}
  </Card>
</div>
