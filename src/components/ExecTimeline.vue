<script setup lang="ts">
import { executionStatusColor, formatDuration } from "../composables/utils.ts";
import { Execution, ExecutionStatus } from "../models/execution.ts";
import { format } from "date-fns";

const maxShown = 5;

defineProps<{
  execs: Execution[];
}>();

const color = (exec: Execution) => "bg-" + executionStatusColor(exec.status);
const date = (exec: Execution) => format(exec.startingDate, "dd/MM HH:mm:ss");
</script>

<template>
  <ol class="items-center text-neutral-100 sm:flex">
    <li
      v-if="execs.length > maxShown"
      class="h-2 w-5 translate-y-1 border-t border-dashed border-neutral-400"
      :title="`${execs.length - maxShown} execution${execs.length - maxShown > 1 ? 's' : ''} not shown`"
    ></li>
    <li
      class="relative mb-6 w-full hover:font-bold hover:text-white sm:mb-0"
      title="Click to see this execution's logs"
      :exec-id="i"
      :key="i"
      v-for="[i, exec] of execs.slice(-maxShown).entries()"
    >
      <div class="text-center font-mono text-xs">
        <time>{{ date(exec) }}</time>
      </div>
      <div class="flex items-center">
        <div class="hidden h-[1px] w-1/2 bg-neutral-400 sm:flex"></div>
        <span
          :class="color(exec) + ' status-dot flex h-3 w-3 shrink-0 items-center justify-center'"
          :title="exec.status"
        ></span>
        <div class="hidden h-[1px] w-1/2 bg-neutral-400 sm:flex"></div>
      </div>
      <div class="text-center text-xs">
        <p v-if="exec.status === ExecutionStatus.CREATED">[...]</p>
        <p v-else-if="exec.status === ExecutionStatus.RUNNING">[...]</p>
        <p v-else>
          [<span class="font-bold">{{ formatDuration(exec.duration) }}</span
          >]
        </p>
      </div>
    </li>
  </ol>
</template>

<style scoped></style>
