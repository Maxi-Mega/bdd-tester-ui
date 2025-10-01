import VueApexCharts from "vue3-apexcharts";

import { createPinia } from "pinia";
import "preline/preline";
import type { IStaticMethods } from "preline/preline";
import { createApp } from "vue";

import App from "./App.vue";

import "./styles/global.css";

const pinia = createPinia();
const app = createApp(App);

declare global {
  interface Window {
    HSStaticMethods: IStaticMethods;
    _: unknown;
  }
}

app.use(pinia);
// @ts-expect-error
app.use(VueApexCharts);

app.mount("#app");
