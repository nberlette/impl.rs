<script lang="ts">
  import { cn } from "$lib/utils";
  import Button from "$lib/components/ui/button.svelte";
  import { Menu, X, Github, Search } from "lucide-svelte";
  import { page } from "$app/stores";

  let mobileMenuOpen = $state(false);

  const navLinks = [
    { href: "/", label: "Discover" },
    { href: "/submit", label: "Submit" },
    { href: "/about", label: "About" }
  ];

  function toggleMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }
</script>

<header
  class="sticky top-0 z-50 w-full border-b bg-background/95 
         backdrop-blur supports-[backdrop-filter]:bg-background/60"
>
  <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
    <div class="flex items-center gap-8">
      <a
        href="/"
        class="flex items-center gap-2 text-xl font-bold text-foreground"
      >
        <span
          class="flex h-8 w-8 items-center justify-center rounded-md 
                 bg-primary text-primary-foreground"
        >
          <span class="font-mono text-sm font-bold">rs</span>
        </span>
        <span class="hidden sm:inline">impl.rs</span>
      </a>

      <nav class="hidden items-center gap-6 md:flex" aria-label="Main">
        {#each navLinks as link}
          <a
            href={link.href}
            class={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              $page.url.pathname === link.href
                ? "text-foreground"
                : "text-muted-foreground"
            )}
          >
            {link.label}
          </a>
        {/each}
      </nav>
    </div>

    <div class="flex items-center gap-3">
      <a
        href="/search"
        class="hidden items-center gap-2 rounded-md border bg-secondary/50 
               px-3 py-1.5 text-sm text-muted-foreground transition-colors
               hover:bg-secondary sm:flex"
        aria-label="Search projects"
      >
        <Search class="h-4 w-4" />
        <span>Search...</span>
        <kbd
          class="pointer-events-none ml-2 hidden rounded border bg-muted 
                 px-1.5 font-mono text-[10px] font-medium lg:inline"
        >
          ⌘K
        </kbd>
      </a>

      <a
        href="https://github.com"
        target="_blank"
        rel="noopener noreferrer"
        class="text-muted-foreground hover:text-foreground transition-colors"
        aria-label="View on GitHub"
      >
        <Github class="h-5 w-5" />
      </a>

      <button
        class="md:hidden text-muted-foreground hover:text-foreground"
        onclick={toggleMenu}
        aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        aria-expanded={mobileMenuOpen}
      >
        {#if mobileMenuOpen}
          <X class="h-6 w-6" />
        {:else}
          <Menu class="h-6 w-6" />
        {/if}
      </button>
    </div>
  </div>

  {#if mobileMenuOpen}
    <nav
      class="border-t bg-background px-4 py-4 md:hidden"
      aria-label="Mobile navigation"
    >
      <div class="flex flex-col gap-3">
        {#each navLinks as link}
          <a
            href={link.href}
            class={cn(
              "rounded-md px-3 py-2 text-sm font-medium transition-colors",
              $page.url.pathname === link.href
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:bg-secondary/50"
            )}
            onclick={() => (mobileMenuOpen = false)}
          >
            {link.label}
          </a>
        {/each}
        <a
          href="/search"
          class="flex items-center gap-2 rounded-md px-3 py-2 text-sm 
                 font-medium text-muted-foreground hover:bg-secondary/50"
          onclick={() => (mobileMenuOpen = false)}
        >
          <Search class="h-4 w-4" />
          Search projects
        </a>
      </div>
    </nav>
  {/if}
</header>
