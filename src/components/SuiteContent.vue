<script setup lang="ts">
import { executionStatusColor, formatDuration } from "../composables/utils.ts";
import { ExecutionStatus } from "../models/execution.ts";
import { useDataStore } from "../stores/data.ts";

import { storeToRefs } from "pinia";
import { computed } from "vue";

const { selectedSuite } = storeToRefs(useDataStore());

const statusColor = computed(() => {
  if (!selectedSuite.value?.lastExec()) {
    return "";
  }

  return "text-" + executionStatusColor(selectedSuite.value.lastExec()?.status as ExecutionStatus);
});
</script>

<template>
  <div v-if="selectedSuite" class="max-h-screen overflow-auto bg-neutral-700 text-neutral-100">
    <h1 class="px-1 text-center text-xl">
      Test Suite:
      <span class="font-semibold">{{ selectedSuite.title }}</span>
    </h1>
    <div class="my-1" v-if="selectedSuite.lastExec()">
      <p class="text-center font-semibold">
        {{ selectedSuite.start()?.toISOString() }} <span class="font-normal">- [</span
        >{{ formatDuration(selectedSuite.durationMs() as number)
        }}<span class="font-normal">] - </span>
        <span :class="statusColor">{{ selectedSuite.lastExec()?.status }}</span>
      </p>
    </div>
    <hr class="my-1 border-neutral-500" />
    <p
      :key="i"
      v-for="[i, desc] in selectedSuite.description.entries()"
      class="px-2 text-sm text-neutral-400"
    >
      {{ desc }}
    </p>
  </div>
</template>

<style scoped></style>
