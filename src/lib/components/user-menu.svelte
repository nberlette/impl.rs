<script lang="ts">
  import { cn } from "$lib/utils";
  import Button from "$lib/components/ui/button.svelte";
  import { Github, LogOut, User, ChevronDown } from "lucide-svelte";
  import { onMount, onDestroy } from "svelte";

  interface Props {
    user: {
      id: number;
      github_username: string;
      name: string | null;
      avatar_url: string | null;
    } | null;
    class?: string;
  }

  let { user, class: className = "", open: menuOpen = $bindable(false) }: Props = $props();

  function toggleMenu() {
    menuOpen = !menuOpen;
  }

  function closeMenu() {
    menuOpen = false;
  }

  function handleClickOutside(e: MouseEvent) {
    closeMenu();
  }
</script>

<svelte:window onkeydown={handleClickOutside} />

<div class={["relative", className]}>
  {#if user}
    <!-- Use button element for proper a11y -->
    <button
      type="button"
      class="flex items-center gap-2 rounded-full border bg-secondary/50 
             py-1 pl-1 pr-3 text-sm transition-colors hover:bg-secondary"
      onclick={(e) => {
        e.stopPropagation();
        toggleMenu();
      }}
      aria-expanded={menuOpen}
      aria-haspopup="true"
    >
      {#if user.avatar_url}
        <img
          src={user.avatar_url || "/placeholder.svg"}
          alt=""
          class="h-7 w-7 rounded-full"
        />
      {:else}
        <div
          class="flex h-7 w-7 items-center justify-center rounded-full 
                 bg-primary/10 text-primary"
        >
          <User class="h-4 w-4" />
        </div>
      {/if}
      <span class="hidden font-medium sm:inline">
        {user.name || user.github_username}
      </span>
      <ChevronDown class="h-4 w-4 text-muted-foreground" />
    </button>

    {#if menuOpen}
      <!-- Use role="dialog" with proper keyboard handling -->
      <div
        class="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border 
               bg-popover p-1 shadow-lg"
        role="menu"
      >
        <div class="border-b px-3 py-2">
          <p class="text-sm font-medium">
            {user.name || user.github_username}
          </p>
          <p class="text-xs text-muted-foreground">@{user.github_username}</p>
        </div>
        <a
          href="https://github.com/{user.github_username}"
          target="_blank"
          rel="noopener noreferrer"
          class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm 
                 text-muted-foreground transition-colors hover:bg-secondary 
                 hover:text-foreground"
          role="menuitem"
        >
          <Github class="h-4 w-4" />
          GitHub Profile
        </a>
        <a
          href="/auth/logout"
          class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm
                 text-destructive transition-colors hover:bg-destructive/10"
          role="menuitem"
        >
          <LogOut class="h-4 w-4" />
          Sign Out
        </a>
      </div>
    {/if}
  {:else}
    <Button
      variant="outline"
      size="sm"
      href="/auth/github"
      class="gap-2"
    >
      <Github class="h-4 w-4" />
      <span class="hidden sm:inline">Sign in with GitHub</span>
      <span class="sm:hidden">Sign in</span>
    </Button>
  {/if}
</div>
