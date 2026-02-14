import { StaticInfo } from "../models/static-info.ts";
import { TestSuite } from "../models/test-suite.ts";
import { Test } from "../models/test.ts";
import {
  API_BASE_PATH,
  KIND_SUITE,
  KIND_TEST,
  fetchAllSuites,
  fetchAllTests,
  fetchStaticInfo,
  fetchStatistics,
  fetchSuite,
  start,
  startAllSuites,
  stop,
  stopAllSuites,
} from "./requests.ts";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("requests", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetchStaticInfo maps payload to StaticInfo", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ windowTitle: "BDD", applicationTitle: "App" }),
    });

    const info = await fetchStaticInfo();

    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_PATH}/info`);
    expect(info).toBeInstanceOf(StaticInfo);
    expect(info.windowTitle).toBe("BDD");
  });

  it("fetchAllSuites parses, sorts and returns TestSuite instances", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => [
        {
          name: "z-suite",
          title: "z-suite",
          description: [],
          filters: {},
          content: [],
          executions: [],
          testsList: [],
        },
        {
          name: "a-suite",
          title: "a-suite",
          description: [],
          filters: {},
          content: [],
          executions: [
            { startingDate: "2026-01-02T00:00:00.000Z", duration: 1, status: "RUNNING" },
          ],
          testsList: [],
        },
      ],
    });

    const suites = await fetchAllSuites();

    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_PATH}/test-suites`);
    expect(suites.map((s) => s.name)).toEqual(["a-suite", "z-suite"]);
    expect(suites[0]).toBeInstanceOf(TestSuite);
    expect(suites[0].executions[0].startingDate).toBeInstanceOf(Date);
  });

  it("fetchSuite parses payload even when response is non-2xx", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      json: async () => ({
        name: "suite-a",
        title: "suite-a",
        description: [],
        filters: {},
        content: [],
        executions: [{ startingDate: "2026-01-02T00:00:00.000Z", duration: 1, status: "RUNNING" }],
        testsList: [],
      }),
    });

    const suite = await fetchSuite("suite-a");

    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_PATH}/test-suites/suite-a`);
    expect(suite).toBeInstanceOf(TestSuite);
  });

  it("fetchAllTests returns parsed tests for successful response", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => [
        {
          name: "t1",
          title: "t1",
          testSuiteName: "suite-a",
          description: [],
          filters: {},
          content: [],
          executions: [
            { startingDate: "2026-01-02T00:00:00.000Z", duration: 1, status: "RUNNING" },
          ],
        },
      ],
    });

    const tests = await fetchAllTests();

    expect(tests).toHaveLength(1);
    expect(tests?.[0]).toBeInstanceOf(Test);
    expect(tests?.[0].executions[0].startingDate).toBeInstanceOf(Date);
  });

  it("fetchAllTests does not throw on error response", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    fetchMock.mockResolvedValue({
      ok: false,
      status: 503,
      statusText: "Unavailable",
      json: async () => [],
    });

    await expect(fetchAllTests()).resolves.toBeUndefined();
    expect(warnSpy).toHaveBeenCalled();
  });

  it("fetchStatistics does not throw on error response", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal",
      json: async () => ({}),
    });

    await expect(fetchStatistics()).resolves.toBeUndefined();
    expect(errorSpy).toHaveBeenCalledWith("Failed to retrieve statistics: 500 - Internal");
  });

  it("start and stop POST to suite/test endpoints", async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({}) });

    await start(KIND_SUITE, "suite-a");
    await stop(KIND_TEST, "test-a");
    await startAllSuites();
    await stopAllSuites();

    expect(fetchMock).toHaveBeenNthCalledWith(1, `${API_BASE_PATH}/test-suites/suite-a/run`, {
      method: "POST",
    });
    expect(fetchMock).toHaveBeenNthCalledWith(2, `${API_BASE_PATH}/tests/test-a/abort`, {
      method: "POST",
    });
    expect(fetchMock).toHaveBeenNthCalledWith(3, `${API_BASE_PATH}/run-test-suites`, {
      method: "POST",
    });
    expect(fetchMock).toHaveBeenNthCalledWith(4, `${API_BASE_PATH}/abort-test-suites`, {
      method: "POST",
    });
  });
});
