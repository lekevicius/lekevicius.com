interface ImportMetaEnv {
  readonly STRAPI_URL: string;
  readonly STRAPI_TOKEN?: string;
  readonly SITE_URL?: string;
  readonly PUBLIC_ROBOTS?: string;
  readonly PUBLIC_STRAPI_ASSET_BASE_URL?: string;
  readonly OG_IMAGE_BASE_URL?: string;
  readonly PUBLIC_OG_IMAGE_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
