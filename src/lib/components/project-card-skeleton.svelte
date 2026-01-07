<script lang="ts">
  import Card from "$lib/components/ui/card.svelte";
  import Skeleton from "$lib/components/ui/skeleton.svelte";
</script>

<Card class="p-5">
  <div class="flex items-start gap-4">
    <Skeleton class="size-12 rounded-lg" />
    <div class="flex-1 space-y-2">
      <Skeleton class="h-5 w-1/3" />
      <Skeleton class="h-4 w-full" />
      <Skeleton class="h-4 w-2/3" />
    </div>
  </div>
  <div class="mt-4 flex gap-2">
    <Skeleton class="h-5 w-16 rounded-full" />
    <Skeleton class="h-5 w-20 rounded-full" />
    <Skeleton class="h-5 w-14 rounded-full" />
  </div>
  <div class="mt-4 flex gap-4">
    <Skeleton class="h-4 w-12" />
    <Skeleton class="h-4 w-12" />
    <Skeleton class="h-4 w-16" />
  </div>
</Card>
