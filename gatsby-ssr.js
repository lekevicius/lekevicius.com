/**
 * Implement Gatsby's SSR (Server Side Rendering) APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/ssr-apis/
 */

// You can delete this file if you're not using it


// exports.onRenderBody = ({ setHeadComponents }, pluginOptions) => {
//   const { feeds } = {
//     ...defaultOptions,
//     ...pluginOptions,
//   }

//   const links = feeds.map(({ output, title }, i) => {
//     if (output.charAt(0) !== `/`) {
//       output = `/` + output
//     }

//     return (
//       <link
//         key={`gatsby-plugin-feed-${i}`}
//         rel="alternate"
//         type="application/rss+xml"
//         title={title}
//         href={withPrefix(output)}
//       />
//     )
//   })

//   setHeadComponents(links)
// }

// latestPosts: allMarkdownRemark(
//   filter: {
//     fileAbsolutePath: {
//       glob: "**/journal/**"
//     }
//   }
//   limit: 10
//   sort: {
//     fields: [frontmatter___date]
//     order: DESC
//   }
// ) {
//   edges {
//     node {
//       fields {
//         journalPath
//       }
//       html
//       frontmatter {
//         title
//         date
//         link
//       }
//     }
//   }
// }