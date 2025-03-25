<script setup lang="ts">
import { executionStatusColor, formatDuration } from "../composables/utils.ts";
import { Execution } from "../models/execution.ts";

import { highlightElement } from "prismjs";
import { computed, onMounted, onUpdated, ref } from "vue";

// Must be imported after "prismjs"
import "prismjs/components/prism-gherkin";

import "../assets/prism.css";

const props = defineProps<{
  kind: "Test" | "Test Suite";
  title: string;
  lastExec: Execution | null;
  description: string[] | null;
  content: string[];
}>();

const statusColor = computed(() => {
  if (!props.lastExec) {
    return "";
  }

  return "text-" + executionStatusColor(props.lastExec.status);
});

const contentEl = ref(null);

onMounted(() => {
  if (contentEl.value) {
    highlightElement(contentEl.value);
  }
});

onUpdated(() => {
  if (contentEl.value) {
    highlightElement(contentEl.value);
  }
});
</script>

<template>
  <div class="bg-transparent text-neutral-100">
    <h1 class="px-1 text-center text-xl">
      {{ kind }}:
      <span class="font-semibold">{{ title }}</span>
    </h1>
    <div class="my-1" v-if="lastExec">
      <p class="text-center font-bold">
        {{ lastExec.startingDate.toISOString() }} <span class="font-normal">- [</span
        >{{ formatDuration(lastExec.duration) }}<span class="font-normal">] - </span>
        <span :class="statusColor">{{ lastExec.status }}</span>
      </p>
    </div>
    <template v-if="description">
      <hr class="my-1 border-slate-300/50" />
      <p :key="i" v-for="[i, desc] in description.entries()" class="px-2 text-sm text-neutral-400">
        {{ desc }}
      </p>
    </template>
    <hr v-if="content" class="mt-1 border-slate-300/50" />
    <pre
      v-if="content"
      class="!my-0 !rounded-none !border-none p-2!"
    ><code ref="contentEl" class="language-gherkin">{{ content.join("\n") }}</code></pre>
    <template v-if="lastExec?.logs">
      <hr class="border-slate-300/50" />
      <pre class="language-none !my-0 !rounded-none !border-none p-2!">{{ lastExec.logs }}</pre>
    </template>
  </div>
</template>
