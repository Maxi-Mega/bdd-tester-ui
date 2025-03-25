import { Execution } from "./execution.ts";
import { Filters } from "./filters.ts";
import { Test } from "./test.ts";

export class TestSuite {
  // @ts-expect-error
  public name: string;
  // @ts-expect-error
  public title: string;
  // @ts-expect-error
  public description: string[];
  // @ts-expect-error
  public filters: Filters;
  // @ts-expect-error
  public content: string[];
  // @ts-expect-error
  public executions: Execution[];
  // @ts-expect-error
  public testsList: Test[];

  // Only used for NO_SUITE_NAME
  constructor(name?: string) {
    if (name) this.name = name;
  }

  public start(): Date | undefined {
    return this.lastExec()?.startingDate;
  }

  public durationMs(): number | undefined {
    return this.lastExec()?.duration;
  }

  public lastExec(): Execution | null {
    if (this.executions.length === 0) {
      return null;
    }

    return this.executions[this.executions.length - 1];
  }
}
