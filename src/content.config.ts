import { generateCollections } from '@sensinum/astro-strapi-loader'

let strapiCollections: any = {}
try {
  strapiCollections = await generateCollections(
    {
      url: import.meta.env.STRAPI_URL,
      token: import.meta.env.STRAPI_TOKEN,
    },
    [
      { name: 'pages', query: { populate: { content: { populate: '*' }, cover: true } } },
      { name: 'projects', query: { populate: { content: { populate: '*' }, image: true, cover: true } } },
      { name: 'articles', query: { populate: { content: { populate: '*' }, cover: true } } },
      { name: 'talks', query: { populate: { content: { populate: '*' }, image: true, cover: true } } },
      { name: 'videos', query: { populate: { content: { populate: '*' }, image: true, cover: true } } },
      { name: 'moments', query: {  } },
      { name: 'appearances', query: {  } },
    ]
  )
} catch (error) {
  console.error(error)
}

// Import utilities from `astro:content`
// import { z, defineCollection } from 'astro:content'
// Define a `loader` and `schema` for each collection
// const articles = defineCollection({
//   loader: glob({ pattern: '**/[^_]*.md', base: './src/content/articles' }),
//   schema: z.object({
//     title: z.string(),
//     date: z.date(),
//     description: z.string(),
//     tag: z.string().optional(),
//     note: z.string().optional(),
//     // image: z.object({
//     //   url: z.string(),
//     //   alt: z.string()
//     // })
//   }),
// })
// Export a single `collections` object to register your collection(s)
export const collections = { ...strapiCollections }

// ---

// const baseSchema = z.array(z.object({
//   icon: z.string(),
//   title: z.string(),
//   link: z.string(),
//   description: z.string(),
// }))

// const clientSchema = z.array(z.object({
//   logo: z.string(),
//   name: z.string(),
//   link: z.string(),
//   contribution: z.string(),
// }))

// const pageSchema = z.object({
//   title: z.string(),
//   description: z.string(),
//   image: z.string().optional(),
// })

// const articleSchema = z.object({
//   title: z.string(),
//   image: z.string().optional(),
// })

// const updatesSchema = z.object({
//   type: z.enum(['article', 'project', 'release', 'appearance']),
//   title: z.string(),
//   description: z.string(),
//   link: z.string(),
//   image: z.string().optional(),
// })

// const resumeSchema = z.record(z.string(), z.array(z.object({
//   logo: z.string(),
//   link: z.string().optional(),
//   place: z.string(),
//   role: z.string(),
//   time: z.string(),
//   description: z.string(),
//   achievements: z.array(z.string())
// })))

// const contactSchema = z.object({
//   block: baseSchema,
//   menu: z.record(z.array(z.object({
//     icon: z.string(),
//     title: z.string(),
//     link: z.string(),
//   })))
// })

// const linksCollection = defineCollection({
//   type: 'data',
//   schema: baseSchema
// });

// export const collections = {
//   'social': linksCollection,
//   'contact': defineCollection({
//     type: 'data',
//     schema: contactSchema
//   }),
//   'clients': defineCollection({
//     type: 'data',
//     schema: clientSchema
//   }),
//   'resume': defineCollection({
//     type: 'data',
//     schema: resumeSchema
//   }),
//   'pages': defineCollection({
//     type: 'content',
//     schema: pageSchema
//   }),
//   'articles': defineCollection({
//     type: 'content',
//     schema: articleSchema
//   }),
//   'updates': defineCollection({
//     type: 'content',
//     schema: updatesSchema
//   })
// };
