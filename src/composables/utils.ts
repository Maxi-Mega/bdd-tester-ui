import { ExecutionStatus } from "../models/execution.ts";
import { TestSuite } from "../models/test-suite.ts";
import { Test, Test as TestType } from "../models/test.ts";

export const NO_SUITE_NAME = "@@_NO_SUITE_@@";
export const NO_SUITE = new TestSuite(NO_SUITE_NAME);

export function formatDuration(durMs: number): string {
  let result = "";

  if (durMs >= 86400000) {
    result += Math.floor(durMs / 86400000) + "d";
    durMs %= 86400000;
  }

  if (durMs >= 3600000) {
    result += Math.floor(durMs / 3600000) + "h";
    durMs %= 3600000;
  }

  if (durMs >= 60000) {
    result += Math.floor(durMs / 60000) + "m";
    durMs %= 60000;
  }

  if (result.includes("d")) {
    return result; // We don't want extra precision
  }

  if (durMs >= 1000) {
    result += Math.floor(durMs / 1000) + "s";
    durMs %= 1000;
  }

  if (result.includes("h") || result.includes("m") || result.includes("s")) {
    return result; // We don't want extra precision
  }

  if (durMs > 0) {
    result += durMs + "ms";
  }

  return result || "0ms";
}

export function parseSuite(v: TestSuite): TestSuite {
  for (let i = 0; i < v.executions.length; i++) {
    v.executions[i].startingDate = new Date(v.executions[i].startingDate);
  }

  for (let i = 0; i < v.testsList.length; i++) {
    v.testsList[i] = parseTest(v.testsList[i]);
  }

  return Object.assign(new TestSuite(), v);
}

export function parseTest(v: Test): Test {
  for (let i = 0; i < v.executions.length; i++) {
    v.executions[i].startingDate = new Date(v.executions[i].startingDate);
  }

  return Object.assign(new Test(), v);
}

export function executionStatusColor(status: ExecutionStatus): string {
  switch (status) {
    case ExecutionStatus.CREATED:
      return "slate-400";
    case ExecutionStatus.RUNNING:
      return "blue-500";
    case ExecutionStatus.FAILED:
      return "red-600";
    case ExecutionStatus.ABORTED:
      return "yellow-400";
    case ExecutionStatus.COMPLETED:
      return "green-600";
    default:
      console.warn(`Unknown execution status '${status}'`);
      return "";
  }
}

export function filterTests(
  tests: TestType[],
  selected: Record<string, Record<string, boolean>>,
  searchQuery: string
): Test[] {
  return tests.filter((test) => {
    for (const [filterType, filterValues] of Object.entries(test.filters)) {
      for (const value of filterValues) {
        if (selected[filterType] && !selected[filterType][value]) {
          return false;
        }
      }
    }

    if (searchQuery && !test.content.some((line) => line.toLowerCase().includes(searchQuery))) {
      return false;
    }

    return true;
  });
}
