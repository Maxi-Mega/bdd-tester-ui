import { createRequire } from 'module';
const require = createRequire(import.meta.url);

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,vue}",
    "./node_modules/preline/dist/*.js",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms'),
    require("preline/plugin"),
  ],
}
