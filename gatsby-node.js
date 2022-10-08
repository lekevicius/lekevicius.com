const path = require('path')
const redirects = require('./redirects.json')

exports.createPages = ({ graphql, actions }) => {
  const { createPage, createRedirect } = actions

  return new Promise((resolve, reject) => {
    const pageTemplate = path.resolve('./src/templates/PageTemplate.js')

    resolve(
      graphql(`{
        pages: allMdx(
          filter: {internal: {contentFilePath: {glob: "**/content/*/content.md"}}}
        ) {
          edges {
            node {
              id
              frontmatter {
                title
                description
              }
              internal {
                contentFilePath
              }
              fields {
                slug
              }
            }
          }
        }
      }`).then(async (result) => {
        if (result.errors) {
          console.log(result.errors)
          reject(result.errors)
        }

        for (const redirect of redirects) {
          createRedirect({ fromPath: redirect.from, toPath: redirect.to, isPermanent: true })
        }

        return await Promise.all([
          
          ...result.data.pages.edges.map(async (page) => {
            return createPage({
              path: `/${page.node.fields.slug}/`,
              component: `${pageTemplate}?__contentFilePath=${page.node.internal.contentFilePath}`,
              context: {
                slug: page.node.fields.slug
              }
            })
          })
        ])
      })
    )
  })
}

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions

  if ((/\/content\/[\w-]+\/content\.md$/).test(node.internal.contentFilePath)) {
    const matches = node.internal.contentFilePath.match(/\/content\/([a-z0-9-]*)\/content\.md$/)
    createNodeField({
      name: `slug`,
      node,
      value: matches[1]
    })
  }
}

exports.onCreateBabelConfig = ({ actions }) => {
  actions.setBabelPlugin({
    name: '@babel/plugin-transform-react-jsx',
    options: {
      runtime: 'automatic',
    },
  });
};

//.replace(/^\/|\/$/g, '') // trim slashes,
// exports.onCreateWebpackConfig = ({
//   stage,
//   rules,
//   loaders,
//   plugins,
//   actions,
// }) => {
//   actions.setWebpackConfig({
//     module: { rules: [ { test: /\.css$/ } ] },
//     plugins: [ new CssoWebpackPlugin() ]
//   })
// }


// (//).test(node.fileAbsolutePath)
// if (node.base === 'feature-image.png') {
//   // const filePath = createFilePath({ node, getNode })
//   const matches = node.absolutePath.match(/\/(projects|journal)\/([\w-]+)\/feature-image.png$/)
//   // console.log("Feature image:", matches)
//   createNodeField({ name: `featureImageType`, node, value: matches[1] })
//   createNodeField({ name: `featureImageSlug`, node, value: matches[2] })
// }

// articles: allMarkdownRemark(
//   filter: { fileAbsolutePath: { glob: "**/content/articles/*/article.md" } }
//   sort: { fields: frontmatter___date, order: DESC }
// ) {
//   edges {
//     node {
//       id
//       frontmatter {
//         date
//         title
//         description
//       }
//       fileAbsolutePath
//       fields {
//         slug
//       }
//     }
//   }
// }

// ...result.data.articles.edges.map(async (article) => {
//   return createPage({
//     path: `/articles/${article.node.fields.slug}/`,
//     component: articleTemplate,
//     context: {
//       slug: article.node.fields.slug
//     }
//   })
// }),
// ...result.data.projects.edges.map(async (project) => {
//   return createPage({
//     path: `/projects/${project.node.fields.slug}/`,
//     component: projectTemplate,
//     context: {
//       slug: project.node.fields.slug
//     }
//   })
// }),