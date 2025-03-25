<script setup lang="ts">
import { useDataStore } from "../stores/data.ts";
import { useStaticInfoStore } from "../stores/static-info.ts";

import FilterDropdown from "./FilterDropdown.vue";

const infoStore = useStaticInfoStore();
const dataStore = useDataStore();
const version = import.meta.env.VITE_APP_VERSION;
</script>

<template>
  <nav
    aria-label="Global"
    class="w-full border-b border-slate-300/50 py-3 pr-4 pl-9 sm:flex sm:items-center sm:justify-between"
  >
    <div class="flex items-center justify-between gap-10">
      <img
        v-if="infoStore.staticInfo.logoBase64"
        :src="infoStore.staticInfo.logoBase64"
        alt="App logo"
        class="max-w-32"
      />
      <h1 v-if="infoStore.staticInfo.applicationTitle" class="text-2xl font-bold text-gray-100">
        {{ infoStore.staticInfo.applicationTitle }}
      </h1>
      <span v-else class="mx-5 px-5"></span>
      <div
        class="ml-10 flex flex-row items-center gap-5 overflow-x-auto pb-2 sm:mt-0 sm:justify-end sm:overflow-x-visible sm:ps-5 sm:pb-0 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-track]:bg-slate-700"
      >
        <FilterDropdown
          v-for="[filterType, filterValues] in Object.entries(dataStore.filters)"
          :key="filterType"
          :filterType="filterType"
          :filterValues="filterValues"
        />
      </div>
    </div>
    <div
      class="mt-5 flex flex-row items-center gap-5 overflow-x-auto pb-2 sm:mt-0 sm:justify-end sm:overflow-x-visible sm:ps-5 sm:pb-0"
    >
      <div class="min-w-12 space-y-3">
        <input
          type="search"
          class="block w-full rounded-md border border-gray-100 bg-transparent px-2 py-1 text-base text-gray-200 placeholder-gray-300 placeholder-shown:border-neutral-200 focus:border-blue-500 focus:ring-neutral-600"
          placeholder="Search (not implemented yet)"
          @input="null /*(e) => (filterStore.searchQuery = (e.target as HTMLInputElement).value)*/"
        />
      </div>
      <p class="min-w-fit text-lg text-white">
        ({{ dataStore.selectedTestsCount }} / {{ dataStore.testsCount }})
      </p>
      <span class="text-neutral-200">{{ version }}</span>
    </div>
  </nav>
</template>
