import { fetchSuite } from "../composables/requests.ts";
import { NO_SUITE_NAME } from "../composables/utils.ts";
import { TestSuite } from "../models/test-suite.ts";
import { Test } from "../models/test.ts";

import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../composables/requests.ts", () => ({
  fetchSuite: vi.fn(),
}));

let createPinia: (() => unknown) | undefined;
let setActivePinia: ((pinia: unknown) => void) | undefined;
let useDataStore:
  | (() => {
      suites: TestSuite[];
      tests: Test[];
      selectedSuite: TestSuite | null;
      selectedTest: Test | null;
      selected: Record<string, Record<string, boolean>>;
      searchQuery: string;
      filters: Record<string, string[]>;
      filteredSuites: TestSuite[];
      selectedTestsCount: number;
      updateSuite: (name: string, suite?: TestSuite) => Promise<void>;
      updateTest: (test: Test) => void;
      makeFilters: () => void;
    })
  | undefined;

function makeTest(
  name: string,
  suiteName: string,
  filters: Record<string, string[]> = {},
  content: string[] = ["line"]
): Test {
  return Object.assign(new Test(), {
    name,
    title: name,
    testSuiteName: suiteName,
    description: [],
    filters,
    content,
    executions: [],
  });
}

function makeSuite(
  name: string,
  filters: Record<string, string[]> = {},
  testsList: Test[] = [],
  content: string[] = ["suite"]
): TestSuite {
  return Object.assign(new TestSuite(), {
    name,
    title: name,
    description: [],
    filters,
    content,
    executions: [],
    testsList,
  });
}

describe("useDataStore", () => {
  beforeAll(async () => {
    vi.stubGlobal("localStorage", {
      getItem: () => null,
      setItem: () => undefined,
      removeItem: () => undefined,
      clear: () => undefined,
      key: () => null,
      length: 0,
    });

    const pinia = await import("pinia");
    createPinia = pinia.createPinia as () => unknown;
    setActivePinia = pinia.setActivePinia as (pinia: unknown) => void;
    const dataStoreModule = await import("./data.ts");
    useDataStore = dataStoreModule.useDataStore;
  });

  beforeEach(() => {
    if (!createPinia || !setActivePinia) {
      throw new Error("Pinia helpers were not initialized");
    }
    setActivePinia(createPinia());
    vi.mocked(fetchSuite).mockReset();
  });

  it("filteredSuites applies selected filters and search query", () => {
    const store = useDataStore?.();
    if (!store) throw new Error("Data store was not initialized");
    const suiteA = makeSuite("a", { env: ["dev"] }, [], ["alpha line"]);
    const suiteB = makeSuite("b", { env: ["prod"] }, [], ["beta line"]);

    store.suites = [suiteA, suiteB];
    store.selected = { env: { dev: true, prod: false } };
    store.searchQuery = "alpha";

    expect(store.filteredSuites).toEqual([suiteA]);
  });

  it("selectedTestsCount for NO_SUITE_NAME counts only tests from filtered suites", () => {
    const store = useDataStore?.();
    if (!store) throw new Error("Data store was not initialized");
    const suiteA = makeSuite(
      "a",
      { env: ["dev"] },
      [
        makeTest("t1", "a", { tag: ["smoke"] }, ["hello"]),
        makeTest("t2", "a", { tag: ["slow"] }, ["hello"]),
      ],
      ["suite alpha"]
    );
    const suiteB = makeSuite(
      "b",
      { env: ["prod"] },
      [makeTest("t3", "b", { tag: ["smoke"] }, ["hello"])],
      ["suite beta"]
    );

    store.suites = [suiteA, suiteB];
    store.selectedSuite = makeSuite(NO_SUITE_NAME);
    store.selected = {
      env: { dev: true, prod: false },
      tag: { smoke: true, slow: false },
    };
    store.searchQuery = "";

    expect(store.selectedTestsCount).toBe(1);
  });

  it("updateSuite updates existing suite, selected references and NO_SUITE tests", async () => {
    const store = useDataStore?.();
    if (!store) throw new Error("Data store was not initialized");
    const oldTest = makeTest("t1", "a");
    const oldSuite = makeSuite("a", {}, [oldTest]);
    const zSuite = makeSuite("z");
    const oldNoSuiteTest = makeTest("t1", "a");

    store.suites = [zSuite, oldSuite];
    store.selectedSuite = oldSuite;
    store.selectedTest = oldTest;
    store.tests = [oldNoSuiteTest];

    const updatedTest = makeTest("t1", "a", { tag: ["smoke"] });
    const updatedSuite = makeSuite("a", { env: ["dev"] }, [updatedTest]);

    await store.updateSuite("a", updatedSuite);

    expect(store.suites.map((s) => s.name)).toEqual(["a", "z"]);
    expect(store.selectedSuite).toEqual(updatedSuite);
    expect(store.selectedTest).toEqual(updatedTest);
    expect(store.tests[0]).toEqual(updatedTest);
  });

  it("updateSuite fetches suite when argument is omitted", async () => {
    const store = useDataStore?.();
    if (!store) throw new Error("Data store was not initialized");
    const fetched = makeSuite("b");
    vi.mocked(fetchSuite).mockResolvedValue(fetched);

    await store.updateSuite("b");

    expect(fetchSuite).toHaveBeenCalledWith("b");
    expect(store.suites[0]).toEqual(fetched);
  });

  it("updateTest updates selected, tests list and suite list", () => {
    const store = useDataStore?.();
    if (!store) throw new Error("Data store was not initialized");
    const original = makeTest("t1", "a", { tag: ["old"] });
    const suiteA = makeSuite("a", {}, [original]);

    store.selectedTest = original;
    store.tests = [original];
    store.suites = [suiteA];

    const updated = makeTest("t1", "a", { tag: ["new"] });
    store.updateTest(updated);

    expect(store.selectedTest).toEqual(updated);
    expect(store.tests[0]).toEqual(updated);
    expect(store.suites[0].testsList[0]).toEqual(updated);
  });

  it("updateTest appends to suite tests list when test does not exist yet", () => {
    const store = useDataStore?.();
    if (!store) throw new Error("Data store was not initialized");
    const suiteA = makeSuite("a", {}, []);
    const newTest = makeTest("t-new", "a");

    store.suites = [suiteA];
    store.tests = [];

    store.updateTest(newTest);

    expect(store.suites[0].testsList).toEqual([newTest]);
  });

  it("makeFilters merges suite/test filters and preserves previous selections", () => {
    const store = useDataStore?.();
    if (!store) throw new Error("Data store was not initialized");
    store.selected = { priority: { high: false } };
    store.suites = [
      makeSuite("a", { priority: ["high"], env: ["dev"] }, [
        makeTest("t1", "a", { priority: ["low"], env: ["dev"] }),
      ]),
      makeSuite("b", { env: ["prod"] }, [makeTest("t2", "b", { priority: ["high"] })]),
    ];

    store.makeFilters();

    expect(store.filters).toEqual({
      priority: ["high", "low"],
      env: ["dev", "prod"],
    });
    expect(store.selected).toEqual({
      priority: { high: false, low: undefined },
      env: { dev: true, prod: true },
    });
  });
});
