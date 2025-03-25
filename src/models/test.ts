import { Execution } from "./execution.ts";
import { Filters } from "./filters.ts";

export class Test {
  // @ts-expect-error
  public name: string;
  // @ts-expect-error
  public title: string;
  // @ts-expect-error
  public testSuiteName: string;
  // @ts-expect-error
  public description: string[];
  // @ts-expect-error
  public filters: Filters;
  // @ts-expect-error
  public content: string[];
  // @ts-expect-error
  public executions: Execution[];

  constructor() {}

  public start(): Date | undefined {
    return this.getExecOrLast()?.startingDate;
  }

  public durationMs(): number | undefined {
    return this.getExecOrLast()?.duration;
  }

  public status(): string | undefined {
    return this.getExecOrLast()?.status;
  }

  public getExecOrLast(execID?: number): Execution | null {
    if (this.executions.length === 0) {
      return null;
    }

    if (execID != undefined && execID < this.executions.length) {
      return this.executions[execID];
    }

    return this.executions[this.executions.length - 1];
  }
}
