import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import VitePluginVueDevTools from "vite-plugin-vue-devtools";

// https://vitejs.dev/config/
// @ts-expect-error
export default ({ mode }) => {
  // @ts-expect-error
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  return defineConfig({
    base: "",
    plugins: [vue(), VitePluginVueDevTools()],
    server: {
      proxy: {
        "/bdd-tester/server/api": {
          // @ts-expect-error
          target: process.env.VITE_API_SERVER_ENDPOINT,
          changeOrigin: true,
          ws: true,
          rewriteWsOrigin: true,
          // rewrite: path => path.replace(/^\/bdd-tester/server/, ""),
        },
      },
    },
  });
}
