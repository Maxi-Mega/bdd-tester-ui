<script setup lang="ts">
import { KIND_TEST, start, stop } from "../composables/requests.ts";
import { executionStatusColor } from "../composables/utils.ts";
import { ExecutionStatus } from "../models/execution.ts";
import type { Test } from "../models/test.ts";
import { SquarePlay, SquareX } from "lucide-vue-next";

import { computed, ref, watch } from "vue";

import ExecTimeline from "./ExecTimeline.vue";

const props = defineProps<{
  test: Test;
  selected: boolean;
}>();

const test = ref(props.test);
const actionInProgress = ref(false);

const bgClass = computed(() => (props.selected ? "bg-white/10" : "bg-transparent"));
const statusColor = computed(() => {
  if (!test.value.getExecOrLast()) {
    return "";
  }

  return "bg-" + executionStatusColor(test.value.status() as ExecutionStatus);
});

watch(
  () => props.test,
  (propsTest) => {
    test.value = propsTest;
  }
);

function startTest() {
  console.info("Starting test", test.value.name);
  actionInProgress.value = true;
  start(KIND_TEST, test.value.name).then(() => {
    actionInProgress.value = false;
  });
}

function stopTest() {
  console.info("Stopping test", test.value.name);
  actionInProgress.value = true;
  stop(KIND_TEST, test.value.name).then(() => {
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
    <div class="flex w-1/12 items-center justify-center">
      <span :class="'status-bar -translate-x-1 ' + statusColor" :title="test.status()"></span>
    </div>
    <div class="w-10/12 py-2">
      <p class="inline-block text-lg font-semibold text-neutral-300 transition duration-100">
        {{ test.name }}
      </p>
      <p v-if="test.description" class="mb-1 text-sm text-neutral-400">
        {{ test.description[0] }}
      </p>
      <ExecTimeline :execs="test.executions || []" />
    </div>
    <div class="flex w-1/12 items-center justify-center">
      <span class="translate-y-0.5 pl-4 text-lg text-gray-500">
        <button
          v-if="test.getExecOrLast()?.status === ExecutionStatus.RUNNING"
          class="cursor-pointer text-neutral-100 transition hover:text-red-600"
          title="Stop"
          @click="stopTest"
        >
          <SquareX />
        </button>
        <span
          v-else-if="actionInProgress || test.getExecOrLast()?.status === ExecutionStatus.CREATED"
          class="cursor-not-allowed text-gray-300"
          >...</span
        >
        <button
          v-else
          class="cursor-pointer text-neutral-100 transition hover:text-green-600"
          title="Start"
          @click="startTest"
        >
          <SquarePlay />
        </button>
      </span>
    </div>
  </div>
</template>

<style scoped></style>
