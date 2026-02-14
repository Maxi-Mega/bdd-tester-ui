import { ExecutionStatus } from "../models/execution.ts";
import { TestSuite } from "../models/test-suite.ts";
import { Test } from "../models/test.ts";
import {
  executionStatusColor,
  filterTests,
  formatDuration,
  parseSuite,
  parseTest,
} from "./utils.ts";

import { describe, expect, it } from "vitest";

describe("formatDuration", () => {
  it("formats duration with expected precision cutoffs", () => {
    expect(formatDuration(0)).toBe("0ms");
    expect(formatDuration(999)).toBe("999ms");
    expect(formatDuration(1000)).toBe("1s");
    expect(formatDuration(61000)).toBe("1m1s");
    expect(formatDuration(3600000 + 120000 + 3000)).toBe("1h2m3s");
    expect(formatDuration(86400000 + 3600000)).toBe("1d1h");
  });
});

describe("parseTest", () => {
  it("converts execution dates and returns a Test instance", () => {
    const raw = {
      name: "t1",
      testSuiteName: "suite-a",
      title: "t1",
      description: [],
      filters: {},
      content: [],
      executions: [{ startingDate: "2026-01-02T03:04:05.000Z", duration: 12, status: "COMPLETED" }],
    } as unknown as Test;

    const parsed = parseTest(raw);

    expect(parsed).toBeInstanceOf(Test);
    expect(parsed.executions[0].startingDate).toBeInstanceOf(Date);
    expect(parsed.executions[0].startingDate.toISOString()).toBe("2026-01-02T03:04:05.000Z");
  });
});

describe("parseSuite", () => {
  it("converts suite and nested test execution dates and returns class instances", () => {
    const raw = {
      name: "suite-a",
      title: "suite-a",
      description: [],
      filters: {},
      content: [],
      executions: [{ startingDate: "2026-01-01T00:00:00.000Z", duration: 10, status: "COMPLETED" }],
      testsList: [
        {
          name: "t1",
          testSuiteName: "suite-a",
          title: "t1",
          description: [],
          filters: {},
          content: [],
          executions: [
            { startingDate: "2026-01-03T00:00:00.000Z", duration: 4, status: "COMPLETED" },
          ],
        },
      ],
    } as unknown as TestSuite;

    const parsed = parseSuite(raw);

    expect(parsed).toBeInstanceOf(TestSuite);
    expect(parsed.executions[0].startingDate).toBeInstanceOf(Date);
    expect(parsed.testsList[0]).toBeInstanceOf(Test);
    expect(parsed.testsList[0].executions[0].startingDate).toBeInstanceOf(Date);
  });
});

describe("executionStatusColor", () => {
  it("maps execution status to color class", () => {
    expect(executionStatusColor(ExecutionStatus.CREATED)).toBe("slate-400");
    expect(executionStatusColor(ExecutionStatus.RUNNING)).toBe("blue-500");
    expect(executionStatusColor(ExecutionStatus.FAILED)).toBe("red-600");
    expect(executionStatusColor(ExecutionStatus.ABORTED)).toBe("yellow-400");
    expect(executionStatusColor(ExecutionStatus.COMPLETED)).toBe("green-600");
  });

  it("returns empty string for unknown status", () => {
    expect(executionStatusColor("INVALID" as ExecutionStatus)).toBe("");
  });
});

describe("filterTests", () => {
  it("filters by selected values and search query", () => {
    const tests = [
      Object.assign(new Test(), {
        name: "t1",
        title: "t1",
        testSuiteName: "suite-a",
        description: [],
        filters: { tag: ["smoke"], team: ["qa"] },
        content: ["first Line"],
        executions: [],
      }),
      Object.assign(new Test(), {
        name: "t2",
        title: "t2",
        testSuiteName: "suite-a",
        description: [],
        filters: { tag: ["slow"], team: ["qa"] },
        content: ["second line"],
        executions: [],
      }),
      Object.assign(new Test(), {
        name: "t3",
        title: "t3",
        testSuiteName: "suite-b",
        description: [],
        filters: { tag: ["smoke"], team: ["ops"] },
        content: ["third line"],
        executions: [],
      }),
    ];

    const selected = {
      tag: { smoke: true, slow: false },
      team: { qa: true, ops: true },
    };

    expect(filterTests(tests, selected, "")).toEqual([tests[0], tests[2]]);
    expect(filterTests(tests, selected, "first")).toEqual([tests[0]]);
    expect(filterTests(tests, selected, "missing")).toEqual([]);
  });
});
