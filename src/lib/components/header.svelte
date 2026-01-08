<script lang="ts">
  import { cn } from "$lib/utils";
  import Button from "$lib/components/ui/button.svelte";
  import UserMenu from "$lib/components/user-menu.svelte";
  import ThemeToggle from "$lib/components/theme-toggle.svelte";
  import LogoLink from "$lib/components/logo-link.svelte";
  import { Menu, Search, X } from "lucide-svelte";
  import { page } from "$app/state";

  let {
    menuOpen: mobileMenuOpen = $bindable(false),
    links: navLinks = $bindable([
      { href: "/", label: "Discover" },
      { href: "/submit", label: "Submit" },
      { href: "/about", label: "About" },
    ]),
    search = $bindable(true),
    user: userData = $bindable(page.data.user),
    fullWidth = $bindable(Boolean(page.url.pathname.startsWith("/admin"))),
    class: className = $bindable(""),
    ...restProps
  } = $props();
  let user = $derived(userData);

  function toggleMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }
</script>

<header
  class={[
    "sticky top-0 inset-x-0 z-48 w-full border-b bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/90",
    className,
  ]}
>
  <div
    class={[
      "mx-auto flex h-16 items-center justify-between px-4",
      fullWidth ? "max-w-full" : "max-w-7xl",
    ]}
  >
    <div class="flex items-center gap-8">
      <LogoLink
        href="/"
        title={page.data.metadata?.title ?? page.data.title ?? "impl.rs"}
      />

      <nav class="hidden items-center gap-6 md:flex" aria-label="Main">
        {#each navLinks as link}
          <a
            href={link.href}
            class={[
              "rounded-sm text-sm transition-colors hover:text-primary",
              "focus-visible:outline-none focus-visible:ring-2",
              "focus-visible:ring-ring focus-visible:ring-offset-2",
              "focus-visible:ring-offset-background",
              page.url.pathname === link.href
                ? "text-primary/85 hover:text-primary font-semibold"
                : !navLinks.some(({ href }) =>
                    href === page.url.pathname
                  )
                ? "text-foreground font-medium"
                : "text-foreground/70 font-medium",
            ]}
          >
            {link.label}
          </a>
        {/each}
      </nav>
    </div>

    <div class="flex items-center gap-3">
      {#if search}
        <a
          href="/search"
          class="
            hidden items-center gap-2 rounded-md border bg-secondary
            px-3 py-1.5 text-sm text-foreground transition-colors
            hover:bg-secondary/80 focus-visible:outline-none
            focus-visible:ring-2 focus-visible:ring-ring
            focus-visible:ring-offset-2 focus-visible:ring-offset-background
            sm:flex
          "
          aria-label="Search projects"
        >
          <Search class="size-4" />
          <span class="text-muted-foreground">Search...</span>
          <kbd
            class="
              pointer-events-none ml-2 hidden rounded border bg-muted
              px-1.5 font-mono text-[10px] font-medium lg:inline
            "
          >
            /
          </kbd>
        </a>
      {/if}

      <ThemeToggle />

      <UserMenu {user} />

      <button
        class={[
          "rounded-sm text-muted-foreground hover:text-foreground",
          "focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-ring focus-visible:ring-offset-2",
          "focus-visible:ring-offset-background md:hidden",
        ]}
        onclick={toggleMenu}
        aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        aria-expanded={mobileMenuOpen}
      >
        {#if mobileMenuOpen}
          <X class="size-6" />
        {:else}
          <Menu class="size-6" />
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
              "focus-visible:outline-none focus-visible:ring-2",
              "focus-visible:ring-ring focus-visible:ring-offset-2",
              "focus-visible:ring-offset-background",
              page.url.pathname === link.href
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:bg-secondary/50",
            )}
            onclick={() => (mobileMenuOpen = false)}
          >
            {link.label}
          </a>
        {/each}
        <a
          href="/search"
          class="
            flex items-center gap-2 rounded-md px-3 py-2 text-sm
            font-medium text-muted-foreground hover:bg-secondary/50
            focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-ring focus-visible:ring-offset-2
            focus-visible:ring-offset-background
          "
          onclick={() => (mobileMenuOpen = false)}
        >
          <Search class="size-4" />
          Search projects
        </a>
      </div>
    </nav>
  {/if}
</header>
