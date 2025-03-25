import { StaticInfo } from "../models/static-info.ts";
import { Stats } from "../models/stats.ts";
import { TestSuite } from "../models/test-suite.ts";
import { Test } from "../models/test.ts";
import { parseSuite, parseTest } from "./utils.ts";

export const KIND_SUITE = "test-suites";
export const KIND_TEST = "tests";

export const API_BASE_PATH = "/bdd-tester/server/api";

export async function fetchStaticInfo(): Promise<StaticInfo> {
  return fetch(`${API_BASE_PATH}/info`)
    .then((resp) => (resp.ok ? resp.json() : Promise.reject(resp)))
    .then((info) => Object.assign(new StaticInfo(), info));
}

async function post(url: string): Promise<void> {
  await fetch(url, { method: "POST" }).catch((err) => console.error(err));
}

export async function start(kind: string, name: string): Promise<void> {
  return post(`${API_BASE_PATH}/${kind}/${name}/run`);
}

export async function stop(kind: string, name: string): Promise<void> {
  return post(`${API_BASE_PATH}/${kind}/${name}/abort`);
}

export async function startAllSuites(): Promise<void> {
  return post(`${API_BASE_PATH}/run-test-suites`);
}

export async function stopAllSuites(): Promise<void> {
  return post(`${API_BASE_PATH}/abort-test-suites`);
}

export async function fetchAllSuites(): Promise<TestSuite[]> {
  return fetch(`${API_BASE_PATH}/test-suites`).then((res) => {
    if (res.ok) {
      return res.json().then((values) => {
        return values
          .map(parseSuite)
          .sort((a: TestSuite, b: TestSuite) => a.name.localeCompare(b.name));
      });
    } else {
      throw new Error(`Failed to retrieve test suites: ${res.status} - ${res.statusText}`);
    }
  });
}

export async function fetchSuite(name: string): Promise<TestSuite> {
  const url = `${API_BASE_PATH}/test-suites/${name}`;

  return fetch(url).then((res) => res.json().then((data) => parseSuite(data)));
}

export async function fetchAllTests(): Promise<Test[]> {
  return fetch(`${API_BASE_PATH}/tests`)
    .then((res) => {
      if (res.ok) {
        return res.json().then((values) => {
          return values.map(parseTest);
        });
      } else {
        throw new Error(`Failed to retrieve tests: ${res.status} - ${res.statusText}`);
      }
    })
    .catch((err) => {
      console.warn(err);
    });
}

export async function fetchStatistics(): Promise<Stats> {
  return fetch(`${API_BASE_PATH}/stats`).then((res) => {
    if (res.ok) {
      return res.json();
    }

    throw new Error(`Failed to retrieve statistics: ${res.status} - ${res.statusText}`);
  });
}
