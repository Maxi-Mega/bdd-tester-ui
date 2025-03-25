<script setup lang="ts">
import { useDataStore } from "../stores/data.ts";

import { onMounted } from "vue";

import DropdownIcon from "./DropdownIcon.vue";

defineProps<{
  filterType: string;
  filterValues: string[];
}>();

const dataStore = useDataStore();

onMounted(() => {
  window.HSStaticMethods.autoInit("dropdown");
});

function handleToggle(filterType: string, filterValue: string, checked: boolean) {
  dataStore.toggleFilter(filterType, filterValue, checked);
}
</script>

<template>
  <div class="hs-dropdown relative inline-flex flex-nowrap items-center [--auto-close:inside]">
    <button
      :id="`hs-dropdown-${filterType}`"
      :title="filterType"
      class="hs-dropdown-toggle ml-1 flex w-full cursor-pointer items-center text-lg font-medium text-gray-200 hover:text-gray-100 focus:text-gray-100"
      type="button"
    >
      {{ filterType }}
      <DropdownIcon />
    </button>
    <div
      class="hs-dropdown-menu duration hs-dropdown-open:opacity-100 z-10 mt-2 hidden min-w-60 divide-neutral-700 rounded-lg border border-neutral-700 bg-neutral-800 p-2 opacity-0 shadow-md transition-[opacity,margin] before:absolute before:start-0 before:-top-4 before:h-4 before:w-full after:absolute after:start-0 after:-bottom-4 after:h-4 after:w-full"
    >
      <div
        v-for="filterValue in filterValues"
        :key="`${filterType}/${filterValue}`"
        class="flex items-center rounded-lg text-sm text-gray-400 hover:bg-gray-700 hover:text-gray-300 focus:ring-2 focus:ring-blue-500"
      >
        <input
          :id="`hs-checked-checkbox-${filterType}-${filterValue}`"
          type="checkbox"
          class="mt-0.5 ml-3 shrink-0 rounded border-neutral-700 bg-neutral-800 text-blue-600 checked:border-blue-500 checked:bg-blue-500 focus:ring-blue-500 focus:ring-offset-gray-800 disabled:pointer-events-none disabled:opacity-50"
          :checked="true"
          @input="
            handleToggle(filterType, filterValue, ($event.target as HTMLInputElement).checked)
          "
        />
        <label
          :for="`hs-checked-checkbox-${filterType}-${filterValue}`"
          class="w-full py-2 pr-3 pl-5 text-base text-gray-400"
        >
          {{ filterValue }}
        </label>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
