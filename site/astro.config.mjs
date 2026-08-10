// @ts-check
import { defineConfig } from "astro/config";
import { loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { ogToS3Bun } from "./src/integrations/og-s3-bun";

const mode = process.env.NODE_ENV ?? "production";
const env = loadEnv(mode, process.cwd(), "");

const ogS3Integration =
  env.OG_BUCKET &&
  env.S3_ENDPOINT &&
  env.S3_ACCESS_KEY_ID &&
  env.S3_SECRET_ACCESS_KEY
    ? ogToS3Bun({
        bucket: env.OG_BUCKET,
        endpoint: env.S3_ENDPOINT,
        region: env.S3_REGION ?? "us-east-1",
        accessKeyId: env.S3_ACCESS_KEY_ID,
        secretAccessKey: env.S3_SECRET_ACCESS_KEY,
        prefix: "og/",
        skipIfSameSize: true,
        deleteLocal: true,
      })
    : undefined;

// https://astro.build/config
export default defineConfig({
  site: "https://lekevicius.com",
  vite: {
    plugins: [tailwindcss()],
  },
  image: {
    domains: ["lekevicius.nbg1.your-objectstorage.com"],
  },
  integrations: [ogS3Integration].filter(Boolean),
});
