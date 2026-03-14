import VueApexCharts from "vue3-apexcharts";

import { createPinia } from "pinia";
import "preline";
import { HSStaticMethods } from "preline";
import { createApp } from "vue";

import App from "./App.vue";

import "./styles/global.css";

const pinia = createPinia();
const app = createApp(App);

declare global {
  interface Window {
    HSStaticMethods: typeof HSStaticMethods;
    _: unknown;
  }
}

app.use(pinia);
app.use(VueApexCharts);

app.mount("#app");
