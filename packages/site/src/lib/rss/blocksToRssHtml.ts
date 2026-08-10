import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import type { Schema } from "hast-util-sanitize";
import rehypeStringify from "rehype-stringify";

import type {
  StrapiContentComponents,
  StrapiMedia,
  StrapiMediaComponent,
  StrapiRichTextComponent,
  StrapiSlideComponent,
} from "../strapiTypes";
import { getStrapiMediaUrl } from "../strapiTypes";

type RssHtmlOptions = {
  site: URL;
  strapiPublicUrl?: string;
};

const ALLOWED_TAGS = [
  "p",
  "br",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "strong",
  "em",
  "u",
  "s",
  "del",
  "code",
  "pre",
  "ul",
  "ol",
  "li",
  "blockquote",
  "a",
  "figure",
  "img",
  "figcaption",
  "hr",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "sup",
  "sub",
  "kbd",
];

const SANITIZE_SCHEMA: Schema = {
  ...defaultSchema,
  tagNames: ALLOWED_TAGS,
  attributes: {
    ...defaultSchema.attributes,
    a: ["href"],
    img: ["src", "alt", "width", "height"],
  },
  protocols: {
    ...defaultSchema.protocols,
    a: ["http", "https", "mailto"],
    img: ["http", "https"],
  },
};

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return char;
    }
  });

const normalizeUrl = (value: string, base: URL, allowedProtocols: string[]) => {
  if (!value) return "";
  if (value.startsWith("#")) return "";
  try {
    const url = new URL(value, base);
    if (!allowedProtocols.includes(url.protocol.replace(":", ""))) return "";
    return url.toString();
  } catch {
    return "";
  }
};

const normalizeImageUrl = (
  value: string,
  site: URL,
  strapiPublicUrl?: string,
) => {
  if (!value) return "";
  if (value.startsWith("/uploads") && strapiPublicUrl) {
    try {
      return new URL(value, strapiPublicUrl).toString();
    } catch {
      return "";
    }
  }
  return normalizeUrl(value, site, ["http", "https"]);
};

const sanitizeMarkdown = (markdown: string, options: RssHtmlOptions) => {
  const { site, strapiPublicUrl } = options;

  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(() => (tree: any) => {
      const visit = (node: any) => {
        if (!node) return;
        if (node.type === "element") {
          if (node.tagName === "h1") node.tagName = "h2";
          if (node.tagName === "a" && node.properties?.href) {
            node.properties.href = normalizeUrl(
              String(node.properties.href),
              site,
              ["http", "https", "mailto"],
            );
          }
          if (node.tagName === "img" && node.properties?.src) {
            node.properties.src = normalizeImageUrl(
              String(node.properties.src),
              site,
              strapiPublicUrl,
            );
          }
          if (node.properties?.className) delete node.properties.className;
          if (node.properties?.style) delete node.properties.style;
        }
        if (node.children) node.children.forEach(visit);
      };
      visit(tree);
    })
    .use(rehypeSanitize, SANITIZE_SCHEMA)
    .use(rehypeStringify);

  return processor.processSync(markdown).toString();
};

const renderMedia = (
  media: StrapiMedia,
  caption?: string | null,
  options?: RssHtmlOptions,
  link?: string | null,
) => {
  if (!media?.url) return "";
  const src = normalizeImageUrl(
    getStrapiMediaUrl(media.url) ?? "",
    options?.site ?? new URL("https://lekevicius.com"),
    options?.strapiPublicUrl,
  );
  if (!src) return "";
  const alt = escapeHtml(media.alternativeText || caption || "");
  const dimensions = [
    media.width ? ` width="${media.width}"` : "",
    media.height ? ` height="${media.height}"` : "",
  ].join("");
  const image = `<img src="${src}" alt="${alt}"${dimensions}>`;
  const normalizedLink = link
    ? normalizeUrl(link, options?.site ?? new URL("https://lekevicius.com"), [
        "http",
        "https",
      ])
    : "";
  const linkedImage = normalizedLink
    ? `<a href="${normalizedLink}">${image}</a>`
    : image;
  const figcaption = caption
    ? `<figcaption>${escapeHtml(caption)}</figcaption>`
    : "";
  return `<figure>${linkedImage}${figcaption}</figure>`;
};

const renderSlide = (slide: StrapiSlideComponent, options: RssHtmlOptions) => {
  const parts: string[] = [];
  if (slide.image) {
    const figure = renderMedia(slide.image, null, options);
    if (figure) parts.push(figure);
  }
  if (slide.text) {
    const textHtml = sanitizeMarkdown(slide.text, options);
    if (textHtml) parts.push(textHtml);
  }
  return parts.join("\n");
};

export const blocksToRssHtml = (
  blocks: StrapiContentComponents | null | undefined,
  options: RssHtmlOptions,
) => {
  if (!blocks || blocks.length === 0) return "";

  const html: string[] = [];

  for (const block of blocks) {
    if (block.__component === "shared.rich-text") {
      const body = (block as StrapiRichTextComponent).body;
      if (body) html.push(sanitizeMarkdown(body, options));
    }

    if (block.__component === "shared.media") {
      const media = block as StrapiMediaComponent;
      const caption = media.caption || media.file?.caption;
      const output = media.file
        ? renderMedia(media.file, caption, options, media.link)
        : "";
      if (output) html.push(output);
    }

    if (block.__component === "shared.slide") {
      const output = renderSlide(block as StrapiSlideComponent, options);
      if (output) html.push(output);
    }
  }

  return html.filter(Boolean).join("\n");
};
