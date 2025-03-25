import { fetchSuite } from "../composables/requests.ts";
import { filterTests } from "../composables/utils.ts";
import { Filters } from "../models/filters.ts";
import { TestSuite } from "../models/test-suite.ts";
import { Test } from "../models/test.ts";

import { defineStore } from "pinia";

export const useDataStore = defineStore("data", {
  state: () => {
    return {
      suites: [] as TestSuite[],
      tests: [] as Test[],
      selectedSuite: null as TestSuite | null,
      selectedTest: null as Test | null,
      filters: {} as Filters,
      selected: {} as Record<string, Record<string, boolean>>,
    };
  },
  getters: {
    filteredSuites: (state) =>
      state.suites.filter((suite) => {
        for (const [filterType, filterValues] of Object.entries(suite.filters)) {
          for (const value of filterValues) {
            if (!state.selected[filterType][value]) {
              return false;
            }
          }
        }

        return true;
      }),
    testsCount: (state) => state.suites.reduce((acc, suite) => acc + suite.testsList.length, 0),
    selectedTestsCount: (state) => {
      // @ts-ignore
      return state.filteredSuites
        .map((suite: TestSuite) => filterTests(suite.testsList, state.selected))
        .flat().length;
    },
  },
  actions: {
    async updateSuite(name: string, suite?: TestSuite) {
      if (!suite) {
        suite = await fetchSuite(name);
      }

      const idx = this.suites.findIndex((s) => s.name === name);
      if (idx >= 0) {
        this.suites[idx] = suite;

        if (this.selectedSuite?.name === name) {
          this.selectedSuite = suite;
        }

        if (this.selectedTest?.testSuiteName === name) {
          const updatedSelected = suite.testsList.find((s) => s.name === this.selectedTest?.name);
          if (updatedSelected) {
            this.selectedTest = updatedSelected;
          }
        }
      } else {
        this.suites.push(suite);
      }

      this.suites.sort((a, b) => a.name.localeCompare(b.name));

      // Update the tests shown via NO_SUITE
      for (const [i, test] of this.tests.entries()) {
        if (test.testSuiteName === name) {
          const updatedTest = suite.testsList.find((s) => s.name === test.name);
          if (updatedTest) {
            this.tests[i] = updatedTest;
          } else {
            // This test no longer exists in the suite.
          }
        }
      }
    },
    updateTest(test: Test) {
      if (this.selectedTest?.name === test.name) {
        this.selectedTest = test;
      }
      const testIdx = this.tests.findIndex((t) => t.name === test.name);
      if (testIdx >= 0) {
        this.tests[testIdx] = test;
      }
      const suiteIdx = this.suites.findIndex((s) => s.name === test.testSuiteName);
      if (suiteIdx >= 0) {
        const testIdxInSuite = this.suites[suiteIdx].testsList.findIndex(
          (t) => t.name === test.name
        );
        if (testIdxInSuite >= 0) {
          this.suites[suiteIdx].testsList[testIdxInSuite] = test;
        } else {
          this.suites[suiteIdx].testsList.push(test);
        }
      }
    },
    makeFilters() {
      const filters: Filters = {};

      for (const suite of this.suites) {
        mergeFilters(filters, suite.filters);
        for (const test of suite.testsList) {
          mergeFilters(filters, test.filters);
        }
      }

      const selected: Record<string, Record<string, boolean>> = {};

      for (const [filterType, filterValues] of Object.entries(filters)) {
        const fRec: Record<string, boolean> = {};

        for (const value of filterValues) {
          fRec[value] = this.selected[filterType] ? this.selected[filterType][value] : true;
        }

        selected[filterType] = fRec;
      }

      this.filters = filters;
      this.selected = selected;
    },
    toggleFilter(filterType: string, filterValue: string, checked: boolean) {
      this.selected[filterType][filterValue] = checked;
    },
  },
});

function mergeFilters(filters: Filters, newFilters: Filters) {
  for (const [filterType, filterValues] of Object.entries(newFilters)) {
    if (filterType in filters) {
      filterValues.forEach((filterValue) => {
        if (!filters[filterType].includes(filterValue)) {
          filters[filterType].push(filterValue);
        }
      });
    } else {
      filters[filterType] = [...filterValues];
    }
  }
}
