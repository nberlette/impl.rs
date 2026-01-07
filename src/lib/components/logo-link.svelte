<script lang="ts">
  import type { ClassValue } from "svelte/elements";

  export interface LogoLinkProps {
    href?: string | URL;
    title?: string;
    class?: ClassValue;
    size?: LogoLinkSize;
    variant?: LogoLinkVariant;

    [rest: string]: any;
  }

  export const sizes = {
    xs: "rounded-sm size-4 ring-1",
    sm: "rounded size-6 ring-2",
    md: "rounded-md size-8 ring-[3px]",
    lg: "rounded-lg size-12 ring-4",
    xl: "rounded-xl size-24 ring-8",
    get default() {
      return this.md;
    },
  } as const;

  export type LogoLinkSize = string & keyof typeof sizes;

  export const variants = {
    primary: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    muted: "bg-muted text-rust-light",
    accent: "bg-accent text-rust",
    rust: "bg-rust text-primary-foreground",
    outline: "ring-primary bg-primary/10 text-primary",
    get default() {
      return this.primary;
    },
  } as const;

  export type LogoLinkVariant = string & keyof typeof variants;

  let {
    href: _href = $bindable("/"),
    title = $bindable("impl.rs"),
    class: className = $bindable(""),
    size = $bindable<LogoLinkSize>("default"),
    variant = $bindable<LogoLinkVariant>("default"),
    ...restProps
  }: LogoLinkProps = $props();

  let href = $derived(_href.toString());
</script>

<a
  {href}
  class={[
    "flex items-center gap-2 rounded-sm text-xl font-bold text-foreground",
    "focus-visible:outline-none focus-visible:ring-2",
    "focus-visible:ring-ring focus-visible:ring-offset-2",
    "focus-visible:ring-offset-background",
    className,
  ]}
  data-sveltekit-preload-code="eager"
  {...restProps}
>
  <span
    class={[
      "flex items-center justify-center ring-transparent ring-offset-transparent ring-inset",
      sizes[size] ?? sizes.default,
      variants[variant] ?? variants.default,
    ]}
    aria-hidden="true"
  >
    <span
      class={["font-mono font-bold select-none", {
        "text-sm": size === "default" || size === "md",
        "text-lg": size === "lg",
        "text-xl": size === "xl",
        "text-xs": size === "sm" || size === "xs",
      }]}
    >rs</span>
  </span>
  <span class="hidden sm:inline-block select-none">impl.rs</span>
</a>
