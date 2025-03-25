/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_APP_VERSION: string;
  readonly VITE_API_SERVER_ENDPOINT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
