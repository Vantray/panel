/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the Vantray API, e.g. `/api/` or `http://127.0.0.1:8000/api/` */
  readonly VITE_BASE_API: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
