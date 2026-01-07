<script lang="ts">
  import { cn } from "$lib/utils";
  import Button from "$lib/components/ui/button.svelte";
  import { ChevronDown, Github, LogOut, User, X } from "lucide-svelte";
  import { onDestroy, onMount } from "svelte";

  interface Props {
    user: {
      id: number;
      github_username: string;
      name: string | null;
      avatar_url: string | null;
    } | null;
    class?: string;
    open?: boolean;

    [rest: string]: unknown;
  }

  let {
    user,
    class: className = "",
    open: menuOpen = $bindable(false),
    ...restProps
  }: Props = $props();

  function toggleMenu() {
    menuOpen = !menuOpen;
  }

  function closeMenu() {
    menuOpen = false;
  }

  let menu: HTMLDivElement | undefined;
</script>

<svelte:document
  on:visibilitychange={closeMenu}
  onkeydown={closeMenu}
  onclick={(e) => {
    const { x, y, currentTarget: doc } = e;
    const elements = doc.elementsFromPoint(x, y);
    // check if the click is outside the user menu
    if (menu && !elements.includes(menu)) {
      closeMenu(); // if so... then close the menu, trick!
      // prevent other side-effects from occurring
      return false;
    }
  }}
/>

<div class={["relative", className]} bind:this={menu}>
  {#if user}
    <button
      type="button"
      class="
        flex items-center gap-2 rounded-full border bg-secondary
        py-1 pl-1 pr-3 text-sm text-foreground transition-colors
        hover:bg-secondary/80 focus-visible:outline-none
        focus-visible:ring-2 focus-visible:ring-ring
        focus-visible:ring-offset-2 focus-visible:ring-offset-background
      "
      onclick={(e) => {
        e.stopPropagation();
        toggleMenu();
      }}
      aria-expanded={menuOpen}
      aria-haspopup="true"
    >
      {#if user.avatar_url}
        <img
          src={user.avatar_url}
          alt=""
          class="size-7 rounded-full"
        />
      {:else}
        <div
          class="
            flex size-7 items-center justify-center rounded-full
            bg-accent-foreground text-accent
          "
        >
          <User class="size-4" />
        </div>
      {/if}
      <span class="hidden font-medium sm:inline">
        {user.name || user.github_username}
      </span>
      <ChevronDown class="size-4 text-foreground/70" />
    </button>

    {#if menuOpen}
      <div
        class="
          absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border
          bg-popover text-popover-foreground p-1 shadow-lg
        "
        role="menu"
      >
        <div class="border-b px-3 py-2">
          <p class="text-sm font-medium">
            {user.name || user.github_username}
          </p>
          <p class="text-xs text-foreground/60">@{user.github_username}</p>
        </div>
        <a
          href="https://github.com/{user.github_username}"
          target="_blank"
          rel="noopener noreferrer"
          class="
            flex w-full items-center gap-2 rounded-md px-3 p-2 text-sm
            text-foreground/80 transition-colors hover:bg-secondary
            hover:text-foreground focus-visible:outline-none
            focus-visible:ring-2 focus-visible:ring-ring
            focus-visible:ring-offset-2 focus-visible:ring-offset-background
          "
          role="menuitem"
        >
          <img
            src="https://github.com/{user.github_username}.png"
            class="size-4 rounded-full"
            alt="{user.github_username}'s avatar"
          />
          GitHub Profile
        </a>
        <a
          href="/auth/logout"
          class="
            flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm
            text-destructive transition-colors hover:bg-destructive/10
            focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-ring focus-visible:ring-offset-2
            focus-visible:ring-offset-background
          "
          role="menuitem"
        >
          <LogOut class="size-4" />
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
      <Github class="size-4" />
      <span class="hidden sm:inline">Sign in with GitHub</span>
      <span class="sm:hidden">Sign in</span>
    </Button>
  {/if}
</div>
