export class Execution {
  // @ts-expect-error
  public startingDate: Date;
  // @ts-expect-error
  public duration: number;
  // @ts-expect-error
  public status: ExecutionStatus;
  // @ts-expect-error
  public logs: string;
}

export enum ExecutionStatus {
  CREATED = "CREATED",
  RUNNING = "RUNNING",
  FAILED = "FAILED",
  ABORTED = "ABORTED",
  COMPLETED = "COMPLETED",
}
