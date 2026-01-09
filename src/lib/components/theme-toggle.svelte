<script lang="ts">
  import { Laptop as System, Moon, Sun } from "lucide-svelte";
  import { onMount } from "svelte";
  import type { SvelteComponentTyped } from "svelte";
  import type { ClassValue } from "svelte/elements";

  type ThemeMode = "system" | "light" | "dark";

  interface ThemeOption {
    value: ThemeMode;
    label: string;
    icon: typeof SvelteComponentTyped<any>;
  }

  const defaultThemeOptions: ThemeOption[] = [
    { value: "system", label: "System", icon: System },
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
  ];

  interface Props {
    options?: ThemeOption[];
    menuOpen?: boolean;
    theme?: ThemeMode;
    class?: ClassValue;
    storageKey?: string;

    [rest: string]: unknown;
  }

  let {
    options: themeOptions = defaultThemeOptions,
    menuOpen = $bindable(false),
    theme = $bindable("system"),
    class: className = "",
    storageKey = "impl-rs-theme",
    ...rest
  }: Props = $props();

  let Icon = $derived.by(() => {
    return themeOptions.find((o) => o.value === theme)?.icon ?? System;
  });
  let label = $derived.by(() => {
    return themeOptions.find((o) => o.value === theme)?.label ?? "System";
  });

  let menu: HTMLDivElement | undefined;
  let mediaQuery: MediaQueryList | null = null;

  function prefers(mode = "dark"): boolean {
    return globalThis.matchMedia?.(`(prefers-color-scheme: ${mode})`)
      ?.matches === true;
  }

  function applyTheme(mode: ThemeMode) {
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      const isDark = mode === "dark" ||
        (mode === "system" && prefers("dark"));
      const isLight = mode === "light" ||
        (mode === "system" && prefers("light"));
      root.classList.toggle("dark", isDark);
      root.classList.toggle("light", isLight);
      root.dataset.theme = mode;
    }
  }

  function setTheme(next: ThemeMode) {
    theme = next;
    localStorage?.setItem(storageKey, next);
    applyTheme(next);
  }

  function toggleMenu() {
    menuOpen = !menuOpen;
  }

  function closeMenu() {
    menuOpen = false;
  }

  onMount(() => {
    const initialTheme = localStorage?.getItem(storageKey) as ThemeMode ??
      null;
    if (
      initialTheme &&
      themeOptions.some((option) => option.value === initialTheme)
    ) {
      theme = initialTheme;
    }
    applyTheme(theme);

    mediaQuery = globalThis.matchMedia?.("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") applyTheme("system");
    };
    mediaQuery?.addEventListener("change", handleChange);

    return () => {
      mediaQuery?.removeEventListener("change", handleChange);
    };
  });
</script>

<svelte:document
  on:visibilitychange={closeMenu}
  onkeydown={(e) => {
    if (e.key === "Escape" && menuOpen) {
      closeMenu();
    }
  }}
  onclick={(e) => {
    const { x, y, currentTarget: doc } = e;
    const elements = doc.elementsFromPoint(x, y);
    // check if the click is outside the user menu
    if (menuOpen && menu && !elements.includes(menu)) {
      closeMenu();
      // prevent other side-effects from occurring
      return false;
    }
  }}
/>

<div class={["relative", className]} bind:this={menu}>
  <button
    type="button"
    class="
      flex items-center gap-2 rounded-md border bg-secondary
      px-2.5 py-1.5 text-sm text-foreground transition-colors
      hover:bg-secondary/80 focus-visible:outline-none
      focus-visible:ring-2 focus-visible:ring-ring
      focus-visible:ring-offset-2 focus-visible:ring-offset-background
    "
    aria-label="Theme"
    aria-haspopup="true"
    aria-expanded={menuOpen}
    onclick={(event) => {
      event.stopPropagation();
      toggleMenu();
    }}
  >
    <Icon class="size-4" />
    <span class="sr-only">{label}</span>
  </button>

  {#if menuOpen}
    <div
      class="
        absolute right-0 top-full z-50 mt-2 w-40 rounded-lg border
        bg-popover text-popover-foreground p-1 shadow-lg
      "
      role="menu"
    >
      {#each themeOptions as option}
        <button
          type="button"
          class="
            flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm
            text-foreground/80 transition-colors hover:bg-secondary
            hover:text-foreground focus-visible:outline-none
            focus-visible:ring-2 focus-visible:ring-ring
            focus-visible:ring-offset-2 focus-visible:ring-offset-background
          "
          role="menuitem"
          onclick={() => {
            setTheme(option.value);
            closeMenu();
          }}
        >
          <option.icon class="size-4" />
          <span>{option.label}</span>
        </button>
      {/each}
    </div>
  {/if}
</div>
