/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GRAPHQL_URL: string
  // add other env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}