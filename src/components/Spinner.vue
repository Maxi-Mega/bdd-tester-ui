<script setup lang="ts">
defineProps<{
  width: string;
}>();
</script>

<template>
  <div :class="width + ' absolute flex h-full items-center justify-center text-center'">
    <div
      class="inline-block size-6 animate-spin rounded-full border-[3px] border-current border-t-transparent text-blue-500"
      role="status"
      aria-label="loading"
    >
      <span class="sr-only">Loading ...</span>
    </div>
  </div>
</template>

<style scoped></style>
