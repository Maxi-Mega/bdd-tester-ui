<script setup lang="ts">
import { NO_SUITE, NO_SUITE_NAME } from "../composables/utils.ts";
import { TestSuite } from "../models/test-suite.ts";
import { useDataStore } from "../stores/data.ts";

import NoSuite from "./NoSuite.vue";
import Spinner from "./Spinner.vue";
import Suite from "./Suite.vue";

defineProps<{
  loading: boolean;
}>();

const emit = defineEmits<{
  selectSuite: [suite: TestSuite];
}>();

const dataStore = useDataStore();

function select(suite: TestSuite) {
  if (suite) {
    emit("selectSuite", suite);
  } else {
    emit("selectSuite", NO_SUITE);
  }
}
</script>

<template>
  <NoSuite :selected="dataStore.selectedSuite?.name === NO_SUITE_NAME" @click="select(NO_SUITE)" />
  <Suite
    v-for="suite of dataStore.filteredSuites"
    :key="suite.name"
    :suite="suite"
    :selected="suite.name === dataStore.selectedSuite?.name"
    @click="select(suite)"
  />
  <Spinner v-if="loading" width="w-3/12" />
</template>
