import type { AstroIntegration } from "astro";
import { readdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mime from "mime-types";

type OgS3BunOptions = {
  bucket: string;
  endpoint: string;
  region?: string;
  accessKeyId: string;
  secretAccessKey: string;
  prefix?: string;
  deleteLocal?: boolean;
  virtualHostedStyle?: boolean;
  skipIfSameSize?: boolean;
};

type BunRuntime = {
  file: (filePath: string) => unknown;
  S3Client: new (opts: {
    accessKeyId: string;
    secretAccessKey: string;
    endpoint?: string;
    region?: string;
    bucket?: string;
    virtualHostedStyle?: boolean;
  }) => {
    write: (
      key: string,
      body: unknown,
      options?: { type?: string },
    ) => Promise<number>;
    size: (key: string) => Promise<number>;
  };
};

async function* walk(dir: string): AsyncGenerator<string> {
  for (const ent of await readdir(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, ent.name);
    if (ent.isDirectory()) yield* walk(entryPath);
    else yield entryPath;
  }
}

export function ogToS3Bun(options: OgS3BunOptions): AstroIntegration {
  const prefix = (options.prefix ?? "og/")
    .replace(/^\//, "")
    .replace(/\/?$/, "/");

  return {
    name: "og-to-s3-bun",
    hooks: {
      "astro:build:done": async ({ dir, logger }) => {
        const distPath = fileURLToPath(dir);
        const ogPath = path.join(distPath, "og");

        try {
          await stat(ogPath);
        } catch {
          logger.info("[og-to-s3-bun] dist/og missing; nothing to upload");
          return;
        }

        const bun = (globalThis as { Bun?: BunRuntime }).Bun;
        if (!bun?.S3Client || !bun.file) {
          throw new Error(
            "[og-to-s3-bun] Bun runtime not available. Run the build with Bun.",
          );
        }

        const s3 = new bun.S3Client({
          accessKeyId: options.accessKeyId,
          secretAccessKey: options.secretAccessKey,
          endpoint: options.endpoint,
          region: options.region ?? "us-east-1",
          bucket: options.bucket,
          virtualHostedStyle: options.virtualHostedStyle,
        });

        let uploaded = 0;
        let skipped = 0;
        for await (const file of walk(ogPath)) {
          const rel = path.relative(ogPath, file).replaceAll(path.sep, "/");
          const key = `${prefix}${rel}`;
          const contentType = mime.lookup(file) || "application/octet-stream";
          const body = bun.file(file);
          const localSize = (await stat(file)).size;

          if (options.skipIfSameSize ?? true) {
            try {
              const remoteSize = await s3.size(key);
              if (remoteSize === localSize) {
                skipped += 1;
                continue;
              }
            } catch {
              // Key missing or HEAD not supported by provider; upload normally.
            }
          }

          await s3.write(key, body, {
            type: typeof contentType === "string" ? contentType : undefined,
          });
          uploaded += 1;
        }

        logger.info(
          `[og-to-s3-bun] uploaded ${uploaded}, skipped ${skipped} object(s) at s3://${options.bucket}/${prefix}`,
        );

        if (options.deleteLocal ?? true) {
          await rm(ogPath, { recursive: true, force: true });
          logger.info("[og-to-s3-bun] removed dist/og");
        }
      },
    },
  };
}
