<script lang="ts">
  import type { ActionData } from "./$types";
  import Button from "$lib/components/ui/button.svelte";
  import Input from "$lib/components/ui/input.svelte";
  import Textarea from "$lib/components/ui/textarea.svelte";
  import Card from "$lib/components/ui/card.svelte";
  import { CheckCircle, Github, Info, Send } from "lucide-svelte";
  import { enhance } from "$app/forms";

  interface Props {
    form: ActionData;
  }

  let { form }: Props = $props();
  let submitting = $state(false);

  let data = $derived.by(() => ({
    github_url: "https://github.com/nberlette/impl.rs",
    name: "",
    email: "",
    reason: "",
    ...form,
  }));

  export const snapshot = {
    capture: () => data,
    restore(snapshot) {
      data = form = { ...data, ...snapshot };
    },
  };
</script>

<svelte:head>
  <title>Submit a Project - impl.rs</title>
  <meta
    name="description"
    content="Submit your Rust project to be featured on impl.rs"
  />
</svelte:head>

<div class="mx-auto max-w-2xl px-4 py-12">
  <div class="mb-8 text-center">
    <div
      class="
        mx-auto mb-4 flex size-14 items-center justify-center
        rounded-xl bg-primary/10
      "
    >
      <Send class="size-7 text-primary" />
    </div>
    <h1 class="text-3xl font-bold text-balance">Submit a Rust Project</h1>
    <p class="mt-2 text-muted-foreground text-pretty">
      Know a great Rust project that deserves more attention? Submit it here and
      help the community discover amazing tools and libraries.
    </p>
  </div>

  {#if form?.success}
    <Card class="p-8 text-center">
      <div
        class="
          mx-auto mb-4 flex size-16 items-center justify-center
          rounded-full bg-success/10
        "
      >
        <CheckCircle class="size-8 text-success" />
      </div>
      <h2 class="text-xl font-semibold">Thank You!</h2>
      <p class="mt-2 text-muted-foreground">
        Your submission has been received and will be reviewed shortly. We
        appreciate your contribution to the Rust community!
      </p>
      <Button href="/" class="mt-6">Back to Home</Button>
    </Card>
  {:else}
    <Card class="p-6 sm:p-8">
      <form
        method="POST"
        use:enhance={() => {
          submitting = true;
          return async ({ update }) => {
            await update();
            submitting = false;
          };
        }}
        class="space-y-6"
      >
        {#if form?.error}
          <div
            class="
              rounded-lg border border-destructive/50 bg-destructive/10
              p-4 text-sm text-destructive
            "
          >
            {form.error}
          </div>
        {/if}

        <div class="space-y-2">
          <label for="github_url" class="text-sm font-medium">
            GitHub Repository URL <span class="text-destructive">*</span>
          </label>
          <div class="relative">
            <Github
              class="
                absolute left-3 top-1/2 size-4 -translate-y-1/2
                text-muted-foreground
              "
            />
            <Input
              id="github_url"
              name="github_url"
              type="url"
              placeholder="https://github.com/owner/repo"
              required
              bind:value={data.github_url}
              class="pl-10"
            />
          </div>
          <p class="text-xs text-muted-foreground">
            The full URL to the GitHub repository
          </p>
        </div>

        <div class="grid gap-6 sm:grid-cols-2">
          <div class="space-y-2">
            <label for="name" class="text-sm font-medium">
              Your Name <span class="text-muted-foreground">(optional)</span>
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Jane Doe"
              bind:value={data.name}
            />
          </div>

          <div class="space-y-2">
            <label for="email" class="text-sm font-medium">
              Email <span class="text-muted-foreground">(optional)</span>
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="jane@example.com"
              bind:value={data.email}
            />
            <p class="text-xs text-muted-foreground">
              We'll notify you when approved
            </p>
          </div>
        </div>

        <div class="space-y-2">
          <label for="reason" class="text-sm font-medium">
            Why should this project be featured?
            <span class="text-muted-foreground">(optional)</span>
          </label>
          <Textarea
            id="reason"
            name="reason"
            placeholder="Tell us what makes this project special..."
            rows={4}
            bind:value={data.reason}
          />
        </div>

        <div class="rounded-lg border bg-secondary/30 p-4">
          <div class="flex gap-3">
            <Info class="size-5 shrink-0 text-primary" />
            <div class="text-sm text-muted-foreground">
              <p class="font-medium text-foreground">Submission Guidelines</p>
              <ul class="mt-2 list-inside list-disc space-y-1">
                <li>Project must be written primarily in Rust</li>
                <li>Repository must be public</li>
                <li>Project should be actively maintained</li>
                <li>No spam, malware, or inappropriate content</li>
              </ul>
            </div>
          </div>
        </div>

        <Button type="submit" class="w-full" disabled={submitting}>
          {#if submitting}
            Submitting...
          {:else}
            Submit Project
          {/if}
        </Button>
      </form>
    </Card>
  {/if}
</div>
