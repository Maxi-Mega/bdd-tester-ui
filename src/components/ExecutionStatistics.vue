<script setup lang="ts">
import type { Stats } from "../models/stats.ts";

import { computed } from "vue";

const props = defineProps<{
  stats: Stats;
}>();

const currentSeries = computed(() => [
  props.stats.current.SUCCESSFUL,
  props.stats.current.FAILED,
  props.stats.current.ABORTED,
  props.stats.current.RUNNING,
  props.stats.current.UNPLAYED,
]);

const currentChartOptions = {
  title: {
    text: "Current Execution",
    align: "left",
    floating: false,
    offsetX: -10,
    style: {
      fontWeight: "normal",
      fontFamily: "Noto Sans",
      color: "var(--color-neutral-100)",
    },
  },
  labels: ["Successful", "Failed", "Aborted", "Running", "Not executed"],
  colors: [
    "var(--color-green-600)",
    "var(--color-red-600)",
    "var(--color-yellow-400)",
    "var(--color-blue-500)",
    "var(--color-neutral-300)",
  ],
  stroke: {
    show: false,
  },
  chart: {
    animations: {
      enabled: false,
    },
  },
  plotOptions: {
    pie: {
      donut: {
        size: "80%",
        labels: {
          show: true,
          name: {
            show: false,
          },
          value: {
            show: true,
            fontSize: "42px",
            color: "var(--color-green-500)",
          },
          total: {
            show: true,
            showAlways: true,
            formatter: function () {
              const total =
                props.stats.current.SUCCESSFUL +
                props.stats.current.FAILED +
                props.stats.current.ABORTED +
                props.stats.current.RUNNING +
                props.stats.current.UNPLAYED;
              if (total === 0) {
                return "0 %";
              }

              return Math.round((props.stats.current.SUCCESSFUL / total) * 100) + " %";
            },
          },
        },
      },
      dataLabels: {
        minAngleToShowLabel: 361, // so as to never show it
      },
    },
  },
  legend: {
    show: true,
    position: "bottom",
    offsetY: 0,
    height: 75,
    fontSize: "14px",
    labels: {
      colors: Array(currentSeries.value.length).fill("var(--color-neutral-100)"),
    },
    itemMargin: {
      horizontal: 10,
    },
    markers: {
      size: 7,
      strokeWidth: 0,
      offsetX: -3,
    },
  },
};

const historyChartOptions = {
  title: {
    text: "Executions Trend",
    align: "left",
    floating: false,
    offsetX: -10,
    style: {
      fontWeight: "normal",
      fontFamily: "Noto Sans",
      color: "var(--color-neutral-100)",
    },
  },
  colors: [
    "var(--color-green-600)",
    "var(--color-red-600)",
    "var(--color-yellow-400)",
    "var(--color-neutral-300)",
  ],
  dataLabels: {
    enabled: false,
  },
  chart: {
    stacked: true,
    toolbar: {
      show: false,
    },
    zoom: {
      enabled: false,
    },
    animations: {
      enabled: false,
    },
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: "96%",
      borderRadius: 4,
      borderRadiusApplication: "end", // 'around', 'end'
      borderRadiusWhenStacked: "all", // 'all', 'last'
      dataLabels: {
        total: {
          enabled: false,
          style: {
            fontSize: "14px",
            color: "var(--color-neutral-100)",
          },
        },
      },
    },
  },
  xaxis: {
    type: "numeric",
    stepSize: 1,
    decimalsInFloat: 0,
    labels: {
      show: true,
      style: {
        colors: Array(50).fill("var(--color-neutral-100)"),
      },
    },
    axisBorder: {
      show: true,
    },
  },
  yaxis: {
    show: true,
    labels: {
      show: true,
      style: {
        colors: ["var(--color-neutral-100)"],
      },
    },
    axisBorder: {
      show: true,
    },
    axisTicks: {
      show: true,
    },
  },
  legend: {
    show: false,
  },
};
</script>

<template>
  <div class="flex flex-row justify-center">
    <div class="mt-7 flex flex-col justify-start gap-y-4">
      <apexchart
        type="donut"
        width="500"
        :options="currentChartOptions"
        :series="currentSeries"
      ></apexchart>

      <apexchart
        type="bar"
        height="350"
        :options="historyChartOptions"
        :series="stats.history"
      ></apexchart>
    </div>
  </div>
</template>
