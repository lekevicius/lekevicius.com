module.exports = {
  siteMetadata: {
    title: 'Jonas Lekevicius',
    author: 'Jonas Lekevicius',
    description: 'I design and build digital things',
    siteUrl: 'https://lekevicius.com',
  },
  plugins: [
    'gatsby-plugin-react-helmet',
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `projects`,
        path: `${__dirname}/src/pages/projects`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `journal`,
        path: `${__dirname}/src/pages/journal`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `root`,
        path: `${__dirname}/src/pages`,
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Jonas Lekevicius`,
        short_name: `Lekevicius`,
        start_url: `/`,
        background_color: `#f3f3f3`,
        theme_color: `#f3f3f3`,
        description: 'I design and build digital things',
        display: `standalone`,
        icons: [
          {src: "favicon.png", sizes: "16x16", type: "image/png"},
          {src: "favicon@2x.png", sizes: "32x32", type: "image/png"},
          {src: "icons/icon-48x48.png", sizes: "48x48", type: "image/png"},
          {src: "icons/icon-72x72.png", sizes: "72x72", type: "image/png"},
          {src: "icons/icon-96x96.png", sizes: "96x96", type: "image/png"},
          {src: "icons/icon-144x144.png", sizes: "144x144", type: "image/png"},
          {src: "icons/icon-192x192.png", sizes: "192x192", type: "image/png"},
          {src: "icons/icon-256x256.png", sizes: "256x256", type: "image/png"},
          {src: "icons/icon-384x384.png", sizes: "384x384", type: "image/png"},
          {src: "icons/icon-512x512.png", sizes: "512x512", type: "image/png"}
        ]
      },
    },
    `gatsby-plugin-offline`,
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        excerpt_separator: `<!--more-->`,
        plugins: [
          {
            resolve: `gatsby-remark-autolink-headers`,
            options: {
              offsetY: `64`,
              icon: `<svg aria-hidden="true" height="20" version="1.1" viewBox="0 0 16 16" width="20"><path fill-rule="evenodd" d="M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z"></path></svg>`,
              className: `header-link`,
              maintainCase: false,
            },
          },
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 640,
              linkImagesToOriginal: false,
              showCaptions: true,
              sizeByPixelDensity: true,
              withWebp: false,
              backgroundColor: '#f2f2f2'
            },
          },
          {
            resolve: `gatsby-remark-responsive-iframe`,
            options: {
              wrapperStyle: `margin-bottom: 1.0725rem`,
            },
          },
          {
            resolve: 'gatsby-remark-code-titles',
            options: {
              className: 'code-title'
            }
          },
          'gatsby-remark-prismjs',
          {
            resolve: 'gatsby-remark-copy-linked-files',
            options: {
              destinationDir: 'downloads',
              ignoreFileExtensions: []
            }
          },
          'gatsby-remark-smartypants',
        ],
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: "UA-38705998-1",
        anonymize: true,
        respectDNT: true
      }
    },
    `gatsby-plugin-catch-links`,
    {
      resolve: `gatsby-plugin-feed`,
      options: {
        query: `
          {
            site {
              siteMetadata {
                title
                description
                siteUrl
                site_url: siteUrl
              }
            }
          }
        `,
        feeds: [
          {
            serialize: ({ query: { site, allMarkdownRemark } }) => {
              return allMarkdownRemark.edges.map(edge => {
                return Object.assign({}, edge.node.frontmatter, {
                  description: edge.node.excerpt,
                  url: (
                    edge.node.frontmatter.link ?
                    edge.node.frontmatter.link :
                    site.siteMetadata.siteUrl + edge.node.fields.journalPath
                  ),
                  guid: site.siteMetadata.siteUrl + edge.node.fields.journalPath,
                  custom_elements: [{ "content:encoded": edge.node.html }],
                })
              })
            },
            query: `
              {
                allMarkdownRemark(
                  limit: 5,
                  sort: { order: DESC, fields: [frontmatter___date] }
                ) {
                  edges {
                    node {
                      excerpt
                      html
                      fields {
                        slug
                        journalPath
                      }
                      frontmatter {
                        title
                        date
                        link
                      }
                    }
                  }
                }
              }
            `,
            output: "/feed.xml",
            title: "Journal Feed",
          },
        ],
      },
    },
    `gatsby-plugin-sitemap`,
  ],
}
