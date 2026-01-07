<script lang="ts">
  import type { PageData } from "./$types";
  import { formatDate, formatNumber, timeAgo } from "$lib/utils";
  import Button from "$lib/components/ui/button.svelte";
  import Badge from "$lib/components/ui/badge.svelte";
  import Card from "$lib/components/ui/card.svelte";
  import {
    ArrowLeft,
    BookOpen,
    Calendar,
    Download,
    ExternalLink,
    Eye,
    GitCommit,
    GitFork,
    Github,
    Package,
    Scale,
    Star,
    Tag,
    Users,
  } from "lucide-svelte";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
  let project = $derived(data.project);

  const stats = $derived([
    { label: "Stargazers", value: formatNumber(project.stars), icon: Star },
    { label: "Forks", value: formatNumber(project.forks), icon: GitFork },
    { label: "Watchers", value: formatNumber(project.watchers), icon: Eye },
    {
      label: "Open Issues",
      value: formatNumber(project.open_issues),
      icon: Package,
    },
  ]);

  const additionalStats = $derived(
    [
      project.total_downloads > 0
        ? {
          label: "Downloads",
          value: formatNumber(project.total_downloads),
          icon: Download,
        }
        : null,
      project.contributors_count > 0
        ? {
          label: "Contributors",
          value: formatNumber(project.contributors_count),
          icon: Users,
        }
        : null,
      project.dependents_count > 0
        ? {
          label: "Dependents",
          value: formatNumber(project.dependents_count),
          icon: Package,
        }
        : null,
      project.release_count > 0
        ? {
          label: "Releases",
          value: formatNumber(project.release_count),
          icon: Tag,
        }
        : null,
    ].filter(Boolean),
  );
</script>

<svelte:head>
  <title>{project.name} - impl.rs</title>
  <meta
    name="description"
    content={project.description || `Explore ${project.name} on impl.rs`}
  />
  <meta property="og:title" content="{project.name} - impl.rs" />
  <meta property="og:description" content={project.description || ""} />
</svelte:head>

<div class="mx-auto max-w-5xl px-4 py-8">
  <a
    href="/"
    class="
      mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground
      hover:text-foreground transition-colors
    "
  >
    <ArrowLeft class="size-4" />
    Back to projects
  </a>

  <header class="mb-8">
    <div class="flex flex-col gap-6 sm:flex-row sm:items-start">
      {#if project.avatar_url}
        <img
          src={project.avatar_url}
          alt=""
          class="size-20 rounded-xl bg-muted object-cover"
        />
      {:else}
        <div
          class="
            flex size-20 items-center justify-center rounded-xl
            bg-primary/10 text-primary
          "
        >
          <span class="text-3xl font-bold">
            {project.name.charAt(0).toUpperCase()}
          </span>
        </div>
      {/if}

      <div class="flex-1">
        <div class="flex flex-wrap items-center gap-3">
          <h1 class="text-3xl font-bold text-foreground">{project.name}</h1>
          {#if project.is_featured}
            <Badge>Featured</Badge>
          {/if}
          {#if project.is_user_submitted}
            <Badge variant="outline">Community</Badge>
          {/if}
        </div>

        <p class="mt-2 text-lg text-muted-foreground text-pretty">
          {project.description || "No description available"}
        </p>

        <div class="mt-4 flex flex-wrap gap-3">
          <Button href={project.github_url}>
            <Github class="size-4" />
            View on GitHub
          </Button>
          {#if project.homepage_url}
            <Button variant="outline" href={project.homepage_url}>
              <ExternalLink class="size-4" />
              Website
            </Button>
          {/if}
          {#if project.crates_io_name}
            <Button
              variant="outline"
              href="https://crates.io/crates/{project.crates_io_name}"
            >
              <Package class="size-4" />
              crates.io
            </Button>
          {/if}
          {#if project.has_docs}
            <Button
              variant="outline"
              href="https://docs.rs/{project.crates_io_name}"
            >
              <BookOpen class="size-4" />
              Docs
            </Button>
          {/if}
        </div>
      </div>
    </div>
  </header>

  <div class="grid gap-6 lg:grid-cols-3">
    <div class="lg:col-span-2 space-y-6">
      <Card class="p-6">
        <h2 class="mb-4 text-lg font-semibold">Statistics</h2>
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {#each stats as stat}
            <div class="text-center">
              <div
                class="
                  mx-auto mb-2 flex size-10 items-center justify-center
                  rounded-lg bg-primary/10 text-primary
                "
              >
                <stat.icon class="size-5" />
              </div>
              <p class="text-xl font-bold">{stat.value}</p>
              <p class="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          {/each}
        </div>

        {#if additionalStats.length > 0}
          <div
            class="mt-6 grid grid-cols-2 gap-4 border-t pt-6 sm:grid-cols-4"
          >
            {#each additionalStats as stat}
              {#if stat}
                <div class="text-center">
                  <div
                    class="
                      mx-auto mb-2 flex size-10 items-center
                      justify-center rounded-lg bg-secondary
                      text-secondary-foreground
                    "
                  >
                    <stat.icon class="size-5" />
                  </div>
                  <p class="text-xl font-bold">{stat.value}</p>
                  <p class="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              {/if}
            {/each}
          </div>
        {/if}
      </Card>

      {#if project.topics && project.topics.length > 0}
        <Card class="p-6">
          <h2 class="mb-4 text-lg font-semibold">Topics</h2>
          <div class="flex flex-wrap gap-2">
            {#each project.topics as topic}
              <span
                class="
                  rounded-full bg-secondary px-3 py-1 text-sm
                  text-secondary-foreground
                "
              >
                {topic}
              </span>
            {/each}
          </div>
        </Card>
      {/if}
    </div>

    <div class="space-y-6">
      <Card class="p-6">
        <h2 class="mb-4 text-lg font-semibold">Details</h2>
        <dl class="space-y-4 text-sm">
          {#if project.license}
            <div class="flex items-start gap-3">
              <Scale class="size-4 mt-0.5 text-muted-foreground" />
              <div>
                <dt class="font-medium">License</dt>
                <dd class="text-muted-foreground">{project.license}</dd>
              </div>
            </div>
          {/if}

          {#if project.github_created_at}
            <div class="flex items-start gap-3">
              <Calendar class="size-4 mt-0.5 text-muted-foreground" />
              <div>
                <dt class="font-medium">Created</dt>
                <dd class="text-muted-foreground">
                  {formatDate(project.github_created_at)}
                </dd>
              </div>
            </div>
          {/if}

          {#if project.last_commit_at}
            <div class="flex items-start gap-3">
              <GitCommit class="size-4 mt-0.5 text-muted-foreground" />
              <div>
                <dt class="font-medium">Last Commit</dt>
                <dd class="text-muted-foreground">
                  {timeAgo(project.last_commit_at)}
                </dd>
              </div>
            </div>
          {/if}

          {#if project.last_release_at}
            <div class="flex items-start gap-3">
              <Tag class="size-4 mt-0.5 text-muted-foreground" />
              <div>
                <dt class="font-medium">Last Release</dt>
                <dd class="text-muted-foreground">
                  {timeAgo(project.last_release_at)}
                </dd>
              </div>
            </div>
          {/if}
        </dl>
      </Card>

      <Card class="p-6">
        <h2 class="mb-4 text-lg font-semibold">Quality Indicators</h2>
        <ul class="space-y-2 text-sm">
          <li class="flex items-center gap-2">
            <span
              class="
                size-2 rounded-full {project.has_readme
                ? 'bg-success'
                : 'bg-muted'}
              "
            ></span>
            <span class={project.has_readme ? "" : "text-muted-foreground"}>
              README
            </span>
          </li>
          <li class="flex items-center gap-2">
            <span
              class="
                size-2 rounded-full {project.has_license
                ? 'bg-success'
                : 'bg-muted'}
              "
            ></span>
            <span class={project.has_license ? "" : "text-muted-foreground"}>
              License
            </span>
          </li>
          <li class="flex items-center gap-2">
            <span
              class="
                size-2 rounded-full {project.has_ci
                ? 'bg-success'
                : 'bg-muted'}
              "
            ></span>
            <span class={project.has_ci ? "" : "text-muted-foreground"}>
              CI/CD
            </span>
          </li>
          <li class="flex items-center gap-2">
            <span
              class="
                size-2 rounded-full {project.has_docs
                ? 'bg-success'
                : 'bg-muted'}
              "
            ></span>
            <span class={project.has_docs ? "" : "text-muted-foreground"}>
              Documentation
            </span>
          </li>
        </ul>
      </Card>
    </div>
  </div>
</div>
