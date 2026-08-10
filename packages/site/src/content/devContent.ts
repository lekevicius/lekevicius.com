import constellationAsset from "../assets/dev-content/constellation.svg";
import fieldNotesAsset from "../assets/dev-content/field-notes.svg";
import interfaceAsset from "../assets/dev-content/interface.svg";
import workshopAsset from "../assets/dev-content/workshop.svg";
import type { ImageMetadata } from "astro";
import type {
  CollectionDataMap,
  CollectionEntryMap,
  StrapiContentComponents,
  StrapiMedia,
  StrapiMediaFormat,
} from "../lib/strapiTypes";

const CREATED_AT = "2026-08-08T09:00:00.000Z";
const UPDATED_AT = "2026-08-08T16:30:00.000Z";

const baseFields = (id: number, createdAt = CREATED_AT) => ({
  id,
  documentId: `dev-document-${id}`,
  createdAt,
  updatedAt: UPDATED_AT,
});

const mediaFormat = (
  name: string,
  url: ImageMetadata,
  width: number,
  height: number,
): StrapiMediaFormat => ({
  name,
  hash: `dev-${name}`,
  ext: ".svg",
  mime: "image/svg+xml",
  width,
  height,
  size: 1,
  url,
});

const media = (
  name: string,
  url: ImageMetadata,
  width: number,
  height: number,
  alternativeText: string,
  caption?: string,
): StrapiMedia => ({
  name: `${name}.svg`,
  alternativeText,
  caption: caption ?? null,
  width,
  height,
  formats: {
    thumbnail: mediaFormat(`${name}-thumbnail`, url, 320, 320),
    small: mediaFormat(`${name}-small`, url, 800, 450),
    medium: mediaFormat(`${name}-medium`, url, 1200, 675),
  },
  hash: `dev-${name}`,
  ext: ".svg",
  mime: "image/svg+xml",
  size: 1,
  url,
  provider: "dev-fixture",
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
});

const fieldNotes = media(
  "field-notes",
  fieldNotesAsset,
  1600,
  900,
  "Field notes spread across a dark workbench",
  "Ideas become useful once they leave the notebook and meet a real day.",
);
const workshop = media(
  "workshop",
  workshopAsset,
  1200,
  1200,
  "A small experimental workshop",
  "The workshop: small enough to understand, complete enough to learn from.",
);
const interfacePreview = media(
  "interface",
  interfaceAsset,
  1600,
  1000,
  "A calm software interface assembled from modular cards",
  "A fictional interface used to verify the website-frame treatment.",
);
const constellation = media(
  "constellation",
  constellationAsset,
  1600,
  900,
  "A constellation of connected ideas",
  "A map is useful even when the territory keeps moving.",
);

const typographyBody = `
This is a **development-only field guide**: one plausible article that exercises the shapes real writing tends to take. It should feel like an essay first and a test fixture second.

The small tools around us have started to feel a little like magic. A sentence becomes a diagram; a rough sketch becomes an interface; a half-remembered fact becomes a trail of sources. The trick is not to make the magic bigger. It is to make our relationship with it more deliberate.

## Begin with a question worth keeping

Most experiments fail before the first prompt is written because the question is too vague. “What can this do?” produces a demo. “Can this help me compare three approaches without hiding the tradeoffs?” produces evidence.

I keep a short checklist beside the workbench:

- Name the decision that must be made.
- Collect the smallest useful set of source material.
- Ask for assumptions to be made visible.
- Keep a human-readable trail back to the evidence.
- Decide what would make the experiment a failure.

That last point matters. A prototype should be allowed to say *no*. Otherwise it is a performance, not an investigation.

### A compact operating loop

1. **Frame** the outcome in one sentence.
2. **Make** the smallest complete version.
3. **Observe** where confidence and reality diverge.
4. **Revise** the system, not merely the wording.

> A useful tool does not remove judgment. It gives judgment better material to work with.

The loop is deliberately ordinary. Its power comes from repetition, not novelty. You can describe it in a tiny bit of pseudocode:

~~~ts
type Experiment = {
  question: string;
  evidence: string[];
  decision: "ship" | "revise" | "stop";
};

const nextStep = (experiment: Experiment) =>
  experiment.evidence.length >= 3 ? "decide" : "observe";
~~~

Notice that \`decision\` includes \`"stop"\`. Good workshops have a bin for discarded ideas.

## Keep the grain of the material

Different inputs want different treatment. Notes can be compressed aggressively; quotations should retain their source; numbers need units and dates; images need captions and useful alternative text. Flattening everything into “context” loses the clues that help us judge it.

| Material | Preserve | Common failure |
| --- | --- | --- |
| Research | source, date, uncertainty | a confident summary with no trail |
| Metrics | definition, unit, comparison | precise numbers answering the wrong question |
| Interviews | speaker, phrasing, situation | themes detached from lived experience |
| Visuals | sequence, hierarchy, caption | decoration presented as evidence |

This is why links should look like [links](https://example.com), inline code like \`aUsefulName\`, and emphasis should remain rare enough to mean something. ~~Every thought needs a flourish.~~ Most thoughts need editing.

### What to review before shipping

- [x] The happy path is understandable.
- [x] Empty and missing states have a deliberate shape.
- [ ] The surprising edge case has been tested with real content.
  - Relative links become absolute in feeds.
  - Images retain captions and alternative text.
  - Long headings do not collapse the rhythm.
- [ ] Someone other than the maker has tried it.

## Leave the workshop ready for tomorrow

The best prototype is not necessarily the one that survives. It is the one that leaves behind a sharper question, a reusable component, or a clear warning. Write down what changed your mind. Label the artifacts. Make the next experiment cheaper.

There is a kind of quiet optimism in this practice: not the belief that every new tool is good, but the belief that careful attention can turn novelty into craft.
`;

const contentShowcase: StrapiContentComponents = [
  { id: 1, __component: "shared.rich-text", body: typographyBody },
  {
    id: 2,
    __component: "shared.media",
    file: fieldNotes,
    display: "plain",
    caption:
      "Plain media follows the reading column and keeps its caption close.",
  },
  {
    id: 3,
    __component: "shared.media",
    file: constellation,
    display: "full",
    caption: "Full media tests the widest editorial image treatment.",
  },
  {
    id: 4,
    __component: "shared.media",
    file: workshop,
    display: "boxed",
    caption: "Boxed media adds a quiet surface around the artifact.",
  },
  {
    id: 5,
    __component: "shared.media",
    file: interfacePreview,
    display: "website",
    caption: "Workshop Log",
    link: "https://example.com/workshop-log",
  },
  {
    id: 6,
    __component: "shared.slide",
    image: constellation,
    text: "### One idea, two readings\n\nA slide pairs an image with explanatory text. It is useful for talks, process notes, and before-and-after stories.\n\n- The picture carries the pattern.\n- The caption carries the argument.",
  },
];

const talkDeckContent: StrapiContentComponents = [
  {
    id: 1,
    __component: "shared.rich-text",
    body: "## Slide deck\n\nTen development-only slides form one coherent talk while exercising varied headings, lists, emphasis, links, and quotations in slide descriptions.",
  },
  {
    id: 2,
    __component: "shared.slide",
    image: constellation,
    text: "### 1. The magic trick\n\nOpacity can be delightful on a stage and dangerous in a tool. This talk begins with a simple proposition: a system becomes useful when people can form an accurate idea of what it will do next.",
  },
  {
    id: 3,
    __component: "shared.slide",
    image: interfacePreview,
    text: "### 2. A boundary is a promise\n\nEvery control implies a promise about cause and effect. Make that promise specific enough that someone can predict the result—and notice when the system breaks it.",
  },
  {
    id: 4,
    __component: "shared.slide",
    image: fieldNotes,
    text: "### 3. Show the source material\n\nA polished answer should not erase its origins. Keep the trail back to the evidence visible:\n\n- name the source;\n- retain its date;\n- preserve the important uncertainty.",
  },
  {
    id: 5,
    __component: "shared.slide",
    image: workshop,
    text: "### 4. Separate observation from inference\n\n**Observation:** three people abandoned the flow at the same step.\n\n**Inference:** the explanation may arrive too late.\n\nKeeping those statements separate makes the next experiment much easier to design.",
  },
  {
    id: 6,
    __component: "shared.slide",
    image: constellation,
    text: "### 5. Make uncertainty useful\n\nA vague warning asks the reader to do all the work. Useful uncertainty names what is unknown, why it matters, and which action remains safe. Confidence is decision support, not decoration.",
  },
  {
    id: 7,
    __component: "shared.slide",
    image: interfacePreview,
    text: "### 6. Design the refusal\n\n> I do not have enough evidence to answer this well.\n\nThat sentence can be a feature. A graceful refusal should explain the limit and offer a concrete way forward instead of inventing certainty.",
  },
  {
    id: 8,
    __component: "shared.slide",
    image: fieldNotes,
    text: "### 7. Keep controls near consequences\n\nPut revision, reversal, and provenance beside the result they affect. Local controls reduce the distance between *I changed this* and *I understand what happened*.",
  },
  {
    id: 9,
    __component: "shared.slide",
    image: workshop,
    text: "### 8. Test with a real decision\n\nA sandbox reveals whether the mechanism works. A real decision reveals whether it helps. Choose a small but consequential task, define success first, and let the prototype fail honestly.",
  },
  {
    id: 10,
    __component: "shared.slide",
    image: constellation,
    text: "### 9. Record what changed your mind\n\nThe most valuable artifact is often not the prototype but the revision history around it. Capture the surprising evidence, the discarded assumption, and the question worth carrying into the next version.",
  },
  {
    id: 11,
    __component: "shared.slide",
    image: interfacePreview,
    text: "### 10. Leave the machine legible\n\nThe closing checklist is deliberately short: expose the boundary, preserve the evidence, communicate uncertainty, and make reversal possible. The goal is not to remove magic—it is to keep agency in the room.",
  },
];

const compactContent = (
  heading: string,
  body: string,
): StrapiContentComponents => [
  {
    id: 1,
    __component: "shared.rich-text",
    body: `## ${heading}\n\n${body}\n\n> This entry comes from the local development source and is never merged into a production build.`,
  },
  {
    id: 2,
    __component: "shared.media",
    file: fieldNotes,
    display: "boxed",
  },
];

const entry = <C extends keyof CollectionEntryMap>(
  collection: C,
  id: string,
  data: CollectionDataMap[C],
): CollectionEntryMap[C] =>
  ({
    id: `dev-${collection}-${id}`,
    collection,
    data,
  }) as CollectionEntryMap[C];

export const devContent: {
  [C in keyof CollectionEntryMap]: CollectionEntryMap[C][];
} = {
  pages: [
    entry("pages", "content-lab", {
      ...baseFields(1001),
      title: "The Content Lab",
      slug: "dev-content-lab",
      description:
        "A development-only page for reviewing long-form typography, media treatments, and content blocks.",
      cover: fieldNotes,
      content: contentShowcase,
    }),
  ],
  articles: [
    entry("articles", "quiet-workshop", {
      ...baseFields(2001),
      title: "The Quiet Workshop: A Field Guide to Small Magic",
      slug: "the-quiet-workshop",
      description:
        "A practical essay about turning unfamiliar tools into a deliberate creative practice—and a complete development fixture for article pages and feeds.",
      cover: fieldNotes,
      content: contentShowcase,
    }),
  ],
  projects: [
    entry("projects", "lantern", {
      ...baseFields(3001, "2026-08-07T09:00:00.000Z"),
      title: "Lantern",
      slug: "dev-lantern",
      description:
        "A tiny research notebook that keeps claims, sources, and open questions in the same view.",
      cover: interfacePreview,
      image: workshop,
      tag: "Lab",
      note: "Active",
      releasedAt: "2026-08-07T09:00:00.000Z",
      active: true,
      content: compactContent(
        "A notebook with a memory",
        "Lantern is a fictional but plausible product case study. This page verifies active-project ordering, badges, square artwork, a cover image, and a compact content story.",
      ),
    }),
    entry("projects", "weather-glass", {
      ...baseFields(3002, "2024-04-12T09:00:00.000Z"),
      title: "Weather Glass",
      slug: "dev-weather-glass",
      description:
        "An ambient forecast that translated tomorrow’s weather into color and movement.",
      cover: constellation,
      image: constellation,
      tag: "Object",
      note: "Archived",
      releasedAt: "2024-04-12T09:00:00.000Z",
      active: false,
      content: compactContent(
        "A forecast you notice in passing",
        "Weather Glass tests the past-project section and shows how an archived experiment retains a useful, readable project page.",
      ),
    }),
  ],
  talks: [
    entry("talks", "legible-machines", {
      ...baseFields(4001, "2026-08-06T09:00:00.000Z"),
      title: "Making Strange Machines Legible",
      slug: "dev-legible-machines",
      recordingLink: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
      presentedAt: "2026-08-06T09:00:00.000Z",
      description:
        "A conference talk about designing understandable boundaries around probabilistic systems.",
      cover: fieldNotes,
      image: fieldNotes,
      tag: "Keynote",
      note: "Recorded",
      content: talkDeckContent,
    }),
    entry("talks", "useful-uncertainty", {
      ...baseFields(4002, "2025-11-18T09:00:00.000Z"),
      title: "Designing with Useful Uncertainty",
      slug: "dev-useful-uncertainty",
      recordingLink: null,
      presentedAt: "2025-11-18T09:00:00.000Z",
      description:
        "A workshop on showing confidence, provenance, and the limits of generated answers.",
      cover: constellation,
      image: constellation,
      tag: "Workshop",
      note: "No video",
      content: compactContent(
        "Workshop outline",
        "A second talk verifies the no-recording state while retaining the rest of the talk detail layout.",
      ),
    }),
  ],
  videos: [
    entry("videos", "prototype-weather", {
      ...baseFields(5001, "2026-08-05T09:00:00.000Z"),
      title: "Prototype the Weather, Not the Dashboard",
      slug: "dev-prototype-weather",
      link: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
      releasedAt: "2026-08-05T09:00:00.000Z",
      description:
        "A short build diary about finding an interface by prototyping the experience around it.",
      cover: interfacePreview,
      image: interfacePreview,
      tag: "Build Log",
      note: "12 min",
      content: compactContent(
        "Behind the prototype",
        "The video fixture exercises YouTube embedding, media-grid artwork, release dates, badges, and the shared detail renderer.",
      ),
    }),
  ],
  moments: [
    entry("moments", "vilnius-summer", {
      ...baseFields(6001, "2026-08-08T08:00:00.000Z"),
      text: "Testing the edges of this site, sketching a new small tool, and making the most of the long summer light.",
      location: "Vilnius, Lithuania",
    }),
  ],
  appearances: [
    entry("appearances", "craft-layer", {
      ...baseFields(7001, "2026-08-04T09:00:00.000Z"),
      date: "2026-08-04T09:00:00.000Z",
      link: "https://example.com/craft-layer",
      publisher: "The Craft Layer",
      title: "Small tools, strong opinions, and a humane pace",
      description:
        "A fictional interview used to review linked appearance entries and longer descriptions.",
      language: "English",
      type: "Podcast",
    }),
    entry("appearances", "rytojaus-dirbtuves", {
      ...baseFields(7002, "2025-10-21T09:00:00.000Z"),
      date: "2025-10-21T09:00:00.000Z",
      link: null,
      publisher: "Rytojaus dirbtuvės",
      title: "Kaip prototipai padeda užduoti geresnius klausimus",
      description:
        "A second fixture verifies an unlinked appearance and Lithuanian-language metadata.",
      language: "Lithuanian",
      type: "Panel",
    }),
  ],
};
