import { getCollection } from "astro:content";
import { OGImageRoute } from "astro-og-canvas";
import siteData from "../../content/metadata.json";
import type {
  ArticleEntry,
  PageEntry,
  ProjectEntry,
  TalkEntry,
  VideoEntry,
} from "../../lib/strapiTypes";

type OgPageData = {
  title: string;
  description?: string;
};

const normalizeKey = (value: string) => {
  const trimmed = value.replace(/^\/+|\/+$/g, "");
  return trimmed.length ? trimmed : "index";
};

const safeText = (value: string | null | undefined, fallback: string) => {
  const text = (value ?? "").toString().trim();
  return text.length ? text : fallback;
};

const staticPages: Record<string, OgPageData> = {
  projects: {
    title: "Projects",
    description: "Apps, tools, and creative works.",
  },
  talks: {
    title: "Talks",
    description: "Conference presentations and keynotes.",
  },
  videos: {
    title: "Videos",
    description: "Video content, recordings, and more.",
  },
  writing: {
    title: "Writing",
    description: "Articles, essays, and thoughts.",
  },
  resume: {
    title: "Resume",
    description: "Work experience and education, so far.",
  },
  appearances: {
    title: "Appearances",
    description: "Podcasts, interviews, and media features.",
  },
  colophon: {
    title: "Colophon",
    description: "How this site is made.",
  },
  "404": {
    title: "Page Not Found",
    description: "Not here, sorry.",
  },
};

const pages: Record<string, OgPageData> = { ...staticPages };

const addPage = (
  key: string | null | undefined,
  title: string | null | undefined,
  description: string | null | undefined,
) => {
  if (!key) return;
  const normalizedKey = normalizeKey(key);
  pages[normalizedKey] = {
    title: safeText(title, siteData.title),
    description: safeText(description, siteData.description),
  };
};

const pageEntries = (await getCollection("pages")) as PageEntry[];
const projectEntries = (await getCollection("projects")) as ProjectEntry[];
const talkEntries = (await getCollection("talks")) as TalkEntry[];
const videoEntries = (await getCollection("videos")) as VideoEntry[];
const articleEntries = (await getCollection("articles")) as ArticleEntry[];

pageEntries.forEach((entry) => {
  addPage(entry.data.slug, entry.data.title, entry.data.description);
});

projectEntries.forEach((entry) => {
  addPage(entry.data.slug, entry.data.title, entry.data.description);
});

talkEntries.forEach((entry) => {
  addPage(entry.data.slug, entry.data.title, entry.data.description);
});

videoEntries.forEach((entry) => {
  addPage(entry.data.slug, entry.data.title, entry.data.description);
});

articleEntries.forEach((entry) => {
  const year = new Date(entry.data.createdAt).getFullYear().toString();
  const slug = entry.data.slug ?? "";
  addPage(`${year}/${slug}`, entry.data.title, entry.data.description);
});

export const { getStaticPaths, GET } = await OGImageRoute({
  pages,
  param: "slug",
  getImageOptions: (_path, page) => ({
    title: page.title,
    description: page.description ?? "",
    padding: 72,
    logo: {
      path: "./src/assets/images/og-logo.png",
    },
    bgImage: {
      path: "./src/assets/images/og-bg.png",
    },
    fonts: [
      "./src/assets/fonts/Inter-Regular.ttf",
      "./src/assets/fonts/Inter-Bold.ttf",
    ],
    font: {
      title: {
        size: 64,
        lineHeight: 1.25,
        families: ["Inter", "sans-serif"],
        weight: "Bold",
        color: [255, 255, 255],
      },
      description: {
        size: 32,
        lineHeight: 1.5,
        families: ["Inter", "sans-serif"],
        weight: "Normal",
        color: [186, 189, 224],
      },
    },
  }),
});
