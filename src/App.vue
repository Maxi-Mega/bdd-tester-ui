<script setup lang="ts">
import {
  API_BASE_PATH,
  fetchAllSuites,
  fetchAllTests,
  fetchStaticInfo,
  fetchStatistics,
} from "./composables/requests.ts";
import { NO_SUITE, NO_SUITE_NAME } from "./composables/utils.ts";
import { Stats } from "./models/stats.ts";
import { TestSuite } from "./models/test-suite.ts";
import { Test } from "./models/test.ts";
import { useDataStore } from "./stores/data.ts";
import { useStaticInfoStore } from "./stores/static-info.ts";

import { useFavicon, useWebSocket } from "@vueuse/core";
import debounce from "debounce";
import { storeToRefs } from "pinia";
import { onBeforeUnmount, onMounted, ref } from "vue";

import Details from "./components/Details.vue";
import ExecutionStatistics from "./components/ExecutionStatistics.vue";
import Nav from "./components/Nav.vue";
import Suites from "./components/Suites.vue";
import Tests from "./components/Tests.vue";

const dataStore = useDataStore();

const wsProto = window.location.protocol === "https:" ? "wss:" : "ws:";
const wsURL = `${wsProto}//${window.location.host}${API_BASE_PATH}/ws`;

const { open, close } = useWebSocket(wsURL, {
  autoReconnect: {
    retries: 5,
    delay: 2000,
    onFailed: handleWSFailure,
  },
  heartbeat: {
    interval: 10000,
    responseMessage: "pong",
  },
  immediate: false,
  onMessage: handleWSEvent,
  onError: () => console.warn("WS error"),
  onConnected: () => console.info("WS connected"),
  onDisconnected: (_, ev) => console.warn("WS disconnected:", ev),
});

onMounted(() => {
  console.log("Opening WS connection..."); // TODO: remove
  open(); // WS connection
});

onBeforeUnmount(() => {
  close(); // WS connection
});

const makeFiltersDebounced = debounce(dataStore.makeFilters, 200);
const makeStatsDebounced = debounce(
  () => fetchStatistics().then((stats) => (statistics.value = stats)),
  200
);

function handleWSEvent(_: WebSocket, event: MessageEvent) {
  try {
    // console.log("WS event:", event.data);
    dataStore.updateSuite(event.data);
    makeFiltersDebounced();
    makeStatsDebounced();
  } catch (e) {
    console.warn("Error while handling WS event:", e);
  }
}

function handleWSFailure() {
  dataStore.$reset();
  alert("Failed to connect WebSocket");
}

fetchStaticInfo().then((info) => {
  useStaticInfoStore().staticInfo = info;

  if (info.windowTitle) document.title = info.windowTitle;
  if (info.faviconBase64) useFavicon(() => info.faviconBase64);
});

const suitesLoading = ref(true);
const testsLoading = ref(false);

const statistics = ref<Stats | undefined>();

fetchStatistics().then((stats) => (statistics.value = stats));

fetchAllSuites()
  .then((suites) => {
    dataStore.suites = suites;
    dataStore.makeFilters();
  })
  .catch((reason) => {
    console.warn(reason);
    alert(reason);
  })
  .finally(() => (suitesLoading.value = false));

const { selectedSuite, selectedTest } = storeToRefs(dataStore);
const selectedExecID = ref<number | undefined>();

function selectSuite(suite: TestSuite) {
  dataStore.selectedTest = null;
  dataStore.selectedSuite = suite;
  if (suite === NO_SUITE && dataStore.tests.length === 0) {
    fetchAllTests()
      .then((tests) => (dataStore.tests = tests))
      .catch((reason) => {
        console.warn(reason);
        alert(reason);
      })
      .finally(() => (testsLoading.value = false));
  }
}

function selectTest(test: Test | null, execID?: number) {
  selectedTest.value = test;
  selectedExecID.value = execID;
}
</script>

<template>
  <Nav />
  <header
    class="flex h-7 w-full flex-row divide-x divide-slate-300/50 font-[Noto_Sans] text-lg text-neutral-200"
  >
    <h1 class="w-3/12 border-b text-center">Test Suites</h1>
    <h1 class="w-4/12 border-b text-center">Tests</h1>
    <h1 class="w-5/12 border-b border-slate-300/50 text-center">
      <template v-if="selectedTest || (selectedSuite && selectedSuite.name !== NO_SUITE_NAME)"
        >Details</template
      >
      <template v-else-if="statistics">Tests Execution Statistics</template>
    </h1>
  </header>
  <main class="flex h-full w-full flex-row divide-x divide-slate-300/50 font-[Noto_Sans]">
    <!-- Suites -->
    <div class="mb-7 w-3/12 overflow-auto pb-16">
      <Suites :loading="suitesLoading" @selectSuite="selectSuite" />
    </div>
    <!-- Tests -->
    <div class="mb-7 w-4/12 overflow-auto pb-16">
      <Tests v-if="selectedSuite" :loading="testsLoading" @selectTest="selectTest" />
    </div>
    <!-- Details -->
    <div class="mb-7 w-5/12 overflow-auto pb-14">
      <Details
        v-if="selectedTest"
        kind="Test"
        :title="selectedTest.title"
        :last-exec="selectedTest.getExecOrLast(selectedExecID)"
        :description="selectedTest.description"
        :content="selectedTest.content"
      />
      <Details
        v-else-if="selectedSuite && selectedSuite.name !== NO_SUITE_NAME"
        kind="Test Suite"
        :title="selectedSuite.title"
        :last-exec="selectedSuite.lastExec()"
        :description="selectedSuite.description"
        :content="selectedSuite.content"
      />
      <ExecutionStatistics v-else-if="statistics" :stats="statistics" />
    </div>
  </main>
  <!-- Load Tailwind classes that are dynamically referenced -->
  <div class="hidden">
    <span class="bg-slate-400 text-slate-400"></span>
    <span class="bg-blue-500 text-blue-500"></span>
    <span class="bg-red-600 text-red-600"></span>
    <span class="bg-yellow-400 text-yellow-400"></span>
    <span class="bg-green-600 text-green-600"></span>
    <span class="text-green-500"></span>
  </div>
</template>
