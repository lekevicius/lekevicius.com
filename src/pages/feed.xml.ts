import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection("articles");
  return rss({
    title: 'Astro Learner | Blog',
    description: 'My journey learning Astro',
    site: context.site || 'https://lekevicius.com',
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
      link: `/posts/${post.id}/`,
    })),
    customData: `<language>en-us</language>`,
  })
}