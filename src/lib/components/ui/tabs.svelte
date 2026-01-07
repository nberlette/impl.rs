<script lang="ts">
  import { cn } from "$lib/utils";
  import type { Snippet } from "svelte";

  interface Tab {
    value: string;
    label: string;
    icon?: Snippet;
  }

  interface Props {
    tabs: Tab[];
    value?: string;
    class?: string;
    onchange?: (value: string) => void;
  }

  let {
    tabs,
    value = $bindable(tabs[0]?.value ?? ""),
    class: className = "",
    onchange,
  }: Props = $props();

  function handleClick(tabValue: string) {
    value = tabValue;
    onchange?.(tabValue);
  }
</script>

<div
  class={cn(
    "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1",
    "text-muted-foreground",
    className,
  )}
  role="tablist"
>
  {#each tabs as tab}
    <button
      role="tab"
      aria-selected={value === tab.value}
      class={cn(
        "inline-flex items-center justify-center gap-1.5 whitespace-nowrap",
        "rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background",
        "transition-all focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        value === tab.value
          ? "bg-background text-foreground shadow-sm"
          : "hover:text-foreground",
      )}
      onclick={() => handleClick(tab.value)}
    >
      {#if tab.icon}
        {@render tab.icon()}
      {/if}
      {tab.label}
    </button>
  {/each}
</div>
