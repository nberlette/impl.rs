<script lang="ts">
  import type { PageData } from "./$types";
  import Card from "$lib/components/ui/card.svelte";
  import Button from "$lib/components/ui/button.svelte";
  import Badge from "$lib/components/ui/badge.svelte";
  import Input from "$lib/components/ui/input.svelte";
  import { cn, formatNumber, timeAgo } from "$lib/utils";
  import { enhance } from "$app/forms";
  import {
    Archive,
    Award,
    ChevronLeft,
    ChevronRight,
    ExternalLink,
    GitFork,
    Search,
    Star,
    Trash2,
  } from "lucide-svelte";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
  let query = $state("");

  let filteredProjects = $derived(data.projects.filter(
    (p) =>
      !query || (
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.description?.toLowerCase().includes(query.toLowerCase())
      ),
  ));

  export const snapshot = {
    capture: () => ({ query }),
    restore: (snapshot) => {
      query = snapshot.query;
    },
  };
</script>

<div class="space-y-6">
  <Card class="p-4">
    <div class="relative">
      <Search
        class="
          absolute left-3 top-1/2 size-4 -translate-y-1/2
          text-muted-foreground
        "
      />
      <Input
        type="search"
        placeholder="Filter projects..."
        bind:value={query}
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
            {#key project}
              {@const name = project.name}
              {@const owner = project.repository_owner}
              {@const repo = project.repository_name}
              {@const avatar = project.avatar_url}
              {@const is_archived = project.is_archived}
              {@const is_featured = project.is_featured}
              {@const github_url = project.github_url}

              <tr class="border-b last:border-0 hover:bg-muted/50">
                <td class="p-4">
                  <div class="flex items-center gap-3">
                    {#if avatar}
                      <img
                        src={avatar}
                        alt="Avatar image for the {owner}/{repo} project"
                        class="size-10 rounded-lg bg-muted object-cover"
                      />
                    {:else}
                      <div
                        class="
                          flex size-10 items-center justify-center
                          rounded-lg bg-primary/10 text-primary
                        "
                      >
                        <span class="font-bold">
                          {name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    {/if}
                    <div class="min-w-0">
                      <p class="truncate font-medium">{name}</p>
                      <p class="truncate text-xs text-muted-foreground">
                        <a
                          href={github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          class="underline text-muted-foreground hover:text-foreground"
                          aria-label="View the {owner}/{repo} project on GitHub"
                        >{owner}/{repo}</a>
                      </p>
                    </div>
                  </div>
                </td>
                <td class="p-4">
                  <div class="flex items-center gap-3 text-sm">
                    <span class="flex items-center gap-1">
                      <Star class="size-4 text-muted-foreground" />
                      {formatNumber(project.stars)}
                    </span>
                    <span class="flex items-center gap-1">
                      <GitFork class="size-4 text-muted-foreground" />
                      {formatNumber(project.forks)}
                    </span>
                  </div>
                </td>
                <td class="p-4">
                  <div class="flex flex-wrap gap-1">
                    {#if is_featured}
                      <Badge variant="default" class="text-xs">Featured</Badge>
                    {/if}
                    {#if is_archived}
                      <Badge variant="secondary" class="text-xs"
                      >Archived</Badge>
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
                      href={github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="
                        rounded-md p-2 text-muted-foreground
                        hover:bg-secondary hover:text-foreground
                      "
                      aria-label="View on GitHub"
                    >
                      <ExternalLink class="size-4" />
                      <span class="sr-only" aria-hidden="true"
                      >View the {owner}/{repo} repository on GitHub</span>
                    </a>

                    <form method="POST" action="?/toggleFeatured" use:enhance>
                      <input type="hidden" name="id" value={project.id} />
                      <input
                        type="hidden"
                        name="is_featured"
                        value={is_featured}
                      />
                      <button
                        type="submit"
                        class="
                          rounded-md p-2 text-muted-foreground
                          hover:bg-secondary hover:text-foreground
                        "
                        aria-label={is_featured
                          ? "Remove from featured"
                          : "Add to featured"}
                        title={is_featured
                          ? "Remove from featured"
                          : "Add to featured"}
                      >
                        <Award
                          class={cn([
                            "size-4",
                            is_featured && "text-primary",
                          ])}
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
                        class="
                          rounded-md p-2 text-muted-foreground
                          hover:bg-secondary hover:text-foreground
                        "
                        aria-label={project.is_archived
                          ? "Unarchive"
                          : "Archive"}
                        title={project.is_archived
                          ? "Unarchive"
                          : "Archive"}
                      >
                        <Archive
                          class="
                            size-4 {project.is_archived
                            ? 'text-warning'
                            : ''}
                          "
                        />
                      </button>
                    </form>

                    <form method="POST" action="?/delete" use:enhance>
                      <input type="hidden" name="id" value={project.id} />
                      <button
                        type="submit"
                        class="
                          rounded-md p-2 text-muted-foreground
                          hover:bg-destructive/10 hover:text-destructive
                        "
                        aria-label="Delete project"
                        title="Delete project"
                      >
                        <Trash2 class="size-4" />
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            {/key}
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
            data-sveltekit-preload-data
          >
            <ChevronLeft class="size-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            href="/admin/projects?page={data.page + 1}"
            disabled={data.page >= data.totalPages}
          >
            Next
            <ChevronRight class="size-4" />
          </Button>
        </div>
      </div>
    {/if}
  </Card>
</div>
