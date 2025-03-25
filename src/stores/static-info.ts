import { StaticInfo } from "../models/static-info.ts";

import { defineStore } from "pinia";

export const useStaticInfoStore = defineStore("static-info", {
  state: () => {
    return { staticInfo: {} as StaticInfo };
  },
  actions: {
    setStaticInfo(staticInfo: StaticInfo): void {
      this.staticInfo = staticInfo;
    },
  },
});
