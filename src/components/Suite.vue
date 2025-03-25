<script setup lang="ts">
import { KIND_SUITE, start, stop } from "../composables/requests.ts";
import { executionStatusColor } from "../composables/utils.ts";
import { ExecutionStatus } from "../models/execution.ts";
import type { TestSuite } from "../models/test-suite.ts";
import { SquarePlay, SquareX } from "lucide-vue-next";

import { computed, ref, watch } from "vue";

import ExecTimeline from "./ExecTimeline.vue";

const props = defineProps<{
  suite: TestSuite;
  selected: boolean;
}>();

const suite = ref(props.suite);
const actionInProgress = ref(false);

const bgClass = computed(() => (props.selected ? "bg-white/10" : "bg-transparent"));
const statusColor = computed(() => {
  if (!props.suite.lastExec()) {
    return "";
  }

  return "bg-" + executionStatusColor(props.suite.lastExec()?.status as ExecutionStatus);
});

watch(
  () => props.suite,
  (propsSuite) => {
    suite.value = propsSuite;
  }
);

function startSuite() {
  console.info("Starting suite", props.suite.name);
  actionInProgress.value = true;
  start(KIND_SUITE, props.suite.name).then(() => {
    actionInProgress.value = false;
  });
}

function stopSuite() {
  console.info("Stopping suite", props.suite.name);
  actionInProgress.value = true;
  stop(KIND_SUITE, props.suite.name).then(() => {
    actionInProgress.value = false;
  });
}
</script>

<template>
  <div
    :class="
      'flex w-full cursor-pointer flex-row border-b border-slate-300/50 ' +
      bgClass +
      ' px-2 pl-0 shadow-sm hover:bg-white/10'
    "
  >
    <div class="mr-1 flex w-1/12 items-center justify-center">
      <span :class="'status-bar ' + statusColor" :title="suite.lastExec()?.status"></span>
    </div>
    <div class="w-10/12 py-2">
      <p class="inline-block text-lg font-semibold text-neutral-300 transition duration-100">
        {{ suite.name }}
      </p>
      <p v-if="suite.description" class="mb-1 text-sm text-neutral-400">
        {{ suite.description[0] }}
      </p>
      <ExecTimeline :execs="suite.executions" />
    </div>
    <div class="flex w-1/12 items-center justify-center">
      <span class="flex translate-y-0.5 pl-2 text-lg">
        <button
          v-if="suite.lastExec()?.status === ExecutionStatus.RUNNING"
          class="cursor-pointer text-neutral-100 transition hover:text-red-600"
          title="Stop"
          @click="stopSuite"
        >
          <SquareX />
        </button>
        <span
          v-else-if="actionInProgress || suite.lastExec()?.status === ExecutionStatus.CREATED"
          class="cursor-not-allowed text-gray-300"
          >...</span
        >
        <button
          v-else
          class="cursor-pointer text-neutral-100 transition hover:text-green-600"
          title="Start"
          @click="startSuite"
        >
          <SquarePlay />
        </button>
      </span>
    </div>
  </div>
</template>
