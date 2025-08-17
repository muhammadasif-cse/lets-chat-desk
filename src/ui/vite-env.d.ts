/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly NODE_ENV: string;
  readonly VITE_API_HTTP_VERSION: string;
  readonly VITE_HUB_PORT: string;
  readonly VITE_HUB_CONNECTION: string;
  readonly VITE_API_HOST: string;
  readonly VITE_API_PORT: string;
  readonly VITE_ASSETS_BASE_PATH: string;
  readonly VITE_CHAT_DELETE_REQUEST_MINUTES: string;
  readonly VITE_API_COMMON_PREFIX: string;
  readonly VITE_API_ASSET_COMMON_PREFIX: string;
  readonly VITE_API_SECRETE_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
