/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PERPLEXITY_API_KEY: string;
  readonly PERPLEXITY_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
