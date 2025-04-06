<script setup lang="ts">
import { NO_SUITE_NAME, filterTests } from "../composables/utils.ts";
import { Test as TestType } from "../models/test.ts";
import { useDataStore } from "../stores/data.ts";

import { storeToRefs } from "pinia";
import { computed } from "vue";

import Spinner from "./Spinner.vue";
import Test from "./Test.vue";

defineProps<{
  loading: boolean;
}>();

const emit = defineEmits<{
  selectTest: [test: TestType | null, execID?: number];
}>();

const dataStore = useDataStore();
const { tests, selectedSuite, selectedTest } = storeToRefs(dataStore);

const _tests = computed(() => {
  if (!selectedSuite.value) {
    return [];
  } else if (selectedSuite.value.name === NO_SUITE_NAME) {
    return filterTests(tests.value, dataStore.selected, dataStore.searchQuery);
  } else {
    return filterTests(selectedSuite.value.testsList, dataStore.selected, dataStore.searchQuery);
  }
});

function select(ev: Event, test: TestType) {
  const r = (ev.target as HTMLElement).closest("[exec-id]");
  if (r) {
    const execID = r.getAttribute("exec-id");
    emit("selectTest", test, Number(execID));
  } else {
    emit("selectTest", test);
  }
}
</script>

<template>
  <Test
    v-for="test of _tests"
    :key="test.name"
    :test="test"
    :selected="test.name === selectedTest?.name"
    @click="select($event, test)"
  />
  <Spinner v-if="loading" width="w-3/12" />
</template>
