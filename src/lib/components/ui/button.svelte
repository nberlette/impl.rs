<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    variant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
    size?: "default" | "sm" | "lg" | "icon";
    class?: string;
    href?: string;
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
    children: Snippet;
    onclick?: (e: MouseEvent) => void;

    [rest: string]: unknown;
  }

  let {
    variant = "default",
    size = "default",
    class: className = "",
    href,
    disabled = false,
    type = "button",
    children,
    onclick,
    ...rest
  }: Props = $props();

  const baseStyles =
    "inline-flex items-center justify-center gap-2 whitespace-nowrap " +
    "rounded-md text-sm font-medium transition-colors " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
    "focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary:
      "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline: "border border-input bg-background hover:bg-accent " +
      "hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    destructive:
      "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  };

  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "size-10",
  };
</script>

{#if href}
  <a
    {href}
    class={[baseStyles, variants[variant], sizes[size], className]}
    aria-disabled={disabled}
    {...rest}
  >
    {@render children?.()}
  </a>
{:else}
  <button
    {type}
    {disabled}
    class={[baseStyles, variants[variant], sizes[size], className]}
    {onclick}
    {...rest}
  >
    {@render children()}
  </button>
{/if}
