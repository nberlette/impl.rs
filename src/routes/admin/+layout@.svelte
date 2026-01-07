<script lang="ts">
  import { cn } from "$lib/utils";
  import { page } from "$app/state";
  import type { Snippet } from "svelte";
  import {
    BarChart3,
    History,
    Inbox,
    LayoutDashboard,
    LogOut,
    Menu,
    Package,
    RefreshCw,
    Settings,
    X,
  } from "lucide-svelte";

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();
  let sidebarOpen = $state(false);

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/projects", label: "Projects", icon: Package },
    { href: "/admin/submissions", label: "Submissions", icon: Inbox },
    { href: "/admin/sync", label: "Sync & Logs", icon: RefreshCw },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/admin/audit", label: "Audit Log", icon: History },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  function isActive(href: string) {
    if (href === "/admin") {
      return page.url.pathname === "/admin";
    }
    return page.url.pathname.startsWith(href);
  }

  function capitalize(s: string): string {
    s = ((s || "") + "").trim();
    return s[0].toLocaleUpperCase() + s.slice(1);
  }

  const title = $derived.by(() => {
    if (page.data.metadata?.title) {
      return capitalize(page.data.metadata.title);
    }
    return capitalize(page.url.pathname.split(/\//).pop() || "Dashboard");
  });
  const description = $derived.by(
    () =>
      page.data.metadata?.description ||
      "Manage the impl.rs platform's content and configuration.",
  );
</script>

<svelte:head>
  <title>{title} - impl.rs Admin</title>
  <meta property="title" content="{title} - impl.rs Admin" />
  <meta property="description" content={description} />
</svelte:head>



<div class="flex min-h-screen bg-background">
  <aside
    class={cn(
      "fixed top-0 bottom-0 left-0 z-40 w-64 transform border-r bg-card transition-transform",
      "lg:sticky lg:top-16! lg:z-auto lg:translate-x-0 [data-open]:translate-x-0 -translate-x-full",
    )}
    data-open={sidebarOpen}
  >
    <div class="flex h-16 items-center justify-between border-b px-4 lg:hidden">
      <a
        href="/admin"
        class="flex items-center gap-2 font-bold text-foreground"
      >
        <span
          class="
            flex size-8 items-center justify-center rounded-md
            bg-primary text-primary-foreground
          "
        >
          <span class="font-mono text-sm">rs</span>
        </span>
        Admin
      </a>
      <button
        onclick={() => (sidebarOpen = false)}
        class="text-muted-foreground inline-block lg:hidden"
        aria-label="Close sidebar"
      >
        <X class="size-5" />
      </button>
    </div>

    <nav class="p-4 lg:sticky lg:top-16" aria-label="Admin navigation">
      <ul class="space-y-1">
        {#each navItems as item}
          <li>
            <a
              href={item.href}
              class={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm",
                "font-medium transition-colors",
                isActive(item.href)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
              onclick={() => (sidebarOpen = false)}
            >
              <item.icon class="size-4" />
              {item.label}
            </a>
          </li>
        {/each}
      </ul>
    </nav>

    <div class="absolute bottom-0 left-0 right-0 border-t p-4">
      <a
        href="/"
        class="
          flex items-center gap-3 rounded-md px-3 py-2 text-sm
          font-medium text-muted-foreground transition-colors
          hover:bg-secondary hover:text-foreground
        "
      >
        <LogOut class="size-4" />
        Exit Admin
      </a>
    </div>
  </aside>

  {#if sidebarOpen}
    <button
      class="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
      onclick={() => (sidebarOpen = false)}
      aria-label="Close sidebar overlay"
    >
    </button>
  {/if}

  <div class="flex flex-1 flex-col">
    <header
      class="
        sticky top-0 z-30 flex h-16 items-center gap-4 border-b
        bg-background/95 px-4 backdrop-blur lg:hidden
      "
    >
      <button
        onclick={() => (sidebarOpen = true)}
        class="lg:hidden text-muted-foreground"
        aria-label="Open sidebarz"
      >
        <Menu class="size-6" />
      </button>
      <h1 class="text-lg font-semibold">{title}</h1>
    </header>

    <main class="flex-1 p-4 lg:p-6">
      <div class="space-y-6">
        <div
          class="flex lg:flex-col gap-4 flex-row items-center justify-between lg:items-start"
        >
          <h2 class="text-2xl font-bold">{title}</h2>
          <p class="text-muted-foreground">{description}</p>
        </div>

        {@render children()}
      </div>
    </main>
  </div>
</div>
