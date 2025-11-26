<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import ProjectCard from "$lib/components/project-card.svelte";
  import ProjectCardSkeleton from "$lib/components/project-card-skeleton.svelte";
  import Input from "$lib/components/ui/input.svelte";
  import Button from "$lib/components/ui/button.svelte";
  import { Search, X } from "lucide-svelte";
  import type { Project } from "$lib/types";

  let query = $state($page.url.searchParams.get("q") || "");
  let results: Project[] = $state([]);
  let loading = $state(false);
  let searched = $state(false);

  async function handleSearch() {
    if (!query.trim()) return;

    loading = true;
    searched = true;

    try {
      const res = await fetch(
        `/api/projects/search?q=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      results = data.projects || [];
      goto(`/search?q=${encodeURIComponent(query)}`, { replaceState: true });
    } catch (err) {
      console.error("Search error:", err);
      results = [];
    } finally {
      loading = false;
    }
  }

  function clearSearch() {
    query = "";
    results = [];
    searched = false;
    goto("/search", { replaceState: true });
  }

  $effect(() => {
    const q = $page.url.searchParams.get("q");
    if (q && q !== query) {
      query = q;
      handleSearch();
    }
  });
</script>

<svelte:head>
  <title>{query ? `Search: ${query}` : "Search"} - impl.rs</title>
</svelte:head>

<div class="mx-auto max-w-4xl px-4 py-12">
  <div class="mb-8 text-center">
    <h1 class="text-3xl font-bold">Search Projects</h1>
    <p class="mt-2 text-muted-foreground">
      Find Rust libraries, tools, and applications
    </p>
  </div>

  <form
    onsubmit={(e) => {
      e.preventDefault();
      handleSearch();
    }}
    class="mb-8"
  >
    <div class="relative">
      <Search
        class="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 
               text-muted-foreground"
      />
      <Input
        type="search"
        placeholder="Search by name or description..."
        bind:value={query}
        class="h-12 pl-12 pr-24 text-base"
      />
      {#if query}
        <button
          type="button"
          onclick={clearSearch}
          class="absolute right-20 top-1/2 -translate-y-1/2 p-1 
                 text-muted-foreground hover:text-foreground"
          aria-label="Clear search"
        >
          <X class="h-4 w-4" />
        </button>
      {/if}
      <Button
        type="submit"
        size="sm"
        class="absolute right-2 top-1/2 -translate-y-1/2"
        disabled={loading || !query.trim()}
      >
        Search
      </Button>
    </div>
  </form>

  {#if loading}
    <div class="grid gap-4 sm:grid-cols-2">
      {#each Array(4) as _}
        <ProjectCardSkeleton />
      {/each}
    </div>
  {:else if results.length > 0}
    <div>
      <p class="mb-4 text-sm text-muted-foreground">
        Found {results.length} result{results.length === 1 ? "" : "s"} for 
        "{query}"
      </p>
      <div class="grid gap-4 sm:grid-cols-2">
        {#each results as project}
          <ProjectCard {project} />
        {/each}
      </div>
    </div>
  {:else if searched}
    <div class="rounded-lg border bg-card p-12 text-center">
      <p class="text-muted-foreground">
        No projects found for "{query}". Try a different search term.
      </p>
    </div>
  {:else}
    <div class="rounded-lg border bg-card p-12 text-center">
      <Search class="mx-auto mb-4 h-8 w-8 text-muted-foreground" />
      <p class="text-muted-foreground">
        Enter a search term to find Rust projects
      </p>
    </div>
  {/if}
</div>
