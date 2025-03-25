export type CurrentStats = {
  SUCCESSFUL: number;
  FAILED: number;
  ABORTED: number;
  RUNNING: number;
  UNPLAYED: number;
};

export type HistoryStats = {
  name: string;
  data: number[];
}[];

export type Stats = {
  current: CurrentStats;
  history: HistoryStats;
};
