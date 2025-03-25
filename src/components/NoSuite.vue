<script setup lang="ts">
import { startAllSuites, stopAllSuites } from "../composables/requests.ts";
import { SquarePlay, SquareX } from "lucide-vue-next";

import { computed } from "vue";

const props = defineProps<{
  selected: boolean;
}>();

const bgClass = computed(() => (props.selected ? "bg-white/10" : "bg-transparent"));

function start() {
  console.info("Starting all suites");
  startAllSuites();
}

function stop() {
  console.info("Stopping all suites");
  stopAllSuites();
}
</script>

<template>
  <div
    :class="
      'flex w-full cursor-pointer flex-row border-b border-slate-300/50 ' +
      bgClass +
      ' p-2 pl-0 shadow-sm hover:bg-white/10'
    "
  >
    <div class="flex w-1/12 items-center justify-center"></div>
    <div class="w-10/12">
      <p
        class="mb-1 inline-block text-lg font-semibold text-neutral-300 transition duration-100 lg:text-xl"
      >
        All Test Suites
      </p>
      <p class="text-base text-neutral-400">All tests</p>
    </div>
    <div class="flex w-1/12 items-center justify-center">
      <span class="flex translate-y-0.5 pr-1 pl-2 text-lg">
        <button
          class="cursor-pointer text-neutral-100 transition hover:text-green-600"
          title="Start"
          @click="start"
        >
          <SquarePlay />
        </button>
        <button
          class="cursor-pointer text-neutral-100 transition hover:text-red-600"
          title="Stop"
          @click="stop"
        >
          <SquareX />
        </button>
      </span>
    </div>
  </div>
</template>
