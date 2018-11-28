const _ = require('lodash')
const path = require('path')
const { createFilePath } = require('gatsby-source-filesystem')

exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions

  return new Promise((resolve, reject) => {
    const journalPostTemplate = path.resolve('./src/templates/JournalPostTemplate.js')
    const journalPageTemplate = path.resolve('./src/templates/JournalPageTemplate.js')
    const projectTemplate = path.resolve('./src/templates/ProjectTemplate.js')
    resolve(
      graphql(
        `
          {
            journalEnteries: allMarkdownRemark(
              filter: {
                fileAbsolutePath: {
                  glob: "**/journal/**"
                }
              }
              limit: 1000
              sort: {
                fields: [frontmatter___date]
                order: DESC
              }
            ) {
              edges {
                node {
                  id
                  fields {
                    slug
                    journalPath
                  }
                  frontmatter {
                    title
                  }
                }
              }
            },
            projects: allMarkdownRemark(
              filter: {
                fileAbsolutePath: {
                  glob: "**/projects/**"
                }
              }
              limit: 1000
            ) {
              edges {
                node {
                  id
                  fields {
                    slug
                    projectPath
                  }
                }
              }
            }
          }
        `
      ).then(result => {
        if (result.errors) {
          console.log(result.errors)
          reject(result.errors)
        }

        // Create blog posts pages.
        const posts = result.data.journalEnteries.edges

        _.each(posts, (post, index) => {
          const previous = index === posts.length - 1 ? null : posts[index + 1].node;
          const next = index === 0 ? null : posts[index - 1].node;

          createPage({
            path: post.node.fields.journalPath,
            component: journalPostTemplate,
            context: {
              slug: post.node.fields.slug,
              journalPath: post.node.fields.journalPath,
              previous,
              next,
            },
          })
        })

        const postsPerPage = 10
        const numPages = Math.ceil(posts.length / postsPerPage)

        Array.from({ length: numPages }).forEach((_, i) => {
          createPage({
            path: i === 0 ? `/journal` : `/journal/page/${i + 1}`,
            component: journalPageTemplate,
            context: {
              limit: postsPerPage,
              skip: i * postsPerPage,
              page: i,
              totalPages: numPages,
            },
          })
        })


        const projects = result.data.projects.edges

        _.each(projects, (project, index) => {
          createPage({
            path: project.node.fields.projectPath,
            component: projectTemplate,
            context: {
              slug: project.node.fields.slug
            },
          })
        })
      })
    )
  })
}

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions

  if ((/\/journal\/[\w-]+\.md$/).test(node.fileAbsolutePath)) {
    let value = createFilePath({ node, getNode })
    if (value.substr(0,8) == '/journal') value = value.substr(8)
    value = value.replace(/^\/|\/$/g, '')
    createNodeField({
      name: `slug`,
      node,
      value,
    })
    const pattern = /^(\d{4})-(\d{2})-(\d{2})-([a-z0-9-]*)$/
    const matches = value.match(pattern)
    const path = `/journal/${matches[1]}/${matches[2]}/${matches[3]}/${matches[4]}/`
    createNodeField({
      name: `journalPath`,
      node,
      value: path,
    })
  }

  if ((/\/projects\/[\w-]+\.md$/).test(node.fileAbsolutePath)) {
    const filePath = createFilePath({ node, getNode })
    var val = filePath.replace(/\//g, '')
    if (val.substr(0,8) == 'projects') val = val.substr(8)

    createNodeField({
      name: `slug`,
      node,
      value: val,
    })
    const value = `/projects/${ val }/`
    createNodeField({
      name: `projectPath`,
      node,
      value,
    })
  }

  // 
  // (//).test(node.fileAbsolutePath)
  if (node.base === 'feature-image.png') {
    // const filePath = createFilePath({ node, getNode })
    const matches = node.absolutePath.match(/\/(projects|journal)\/([\w-]+)\/feature-image.png$/)
    // console.log("Feature image:", matches)
    createNodeField({ name: `featureImageType`, node, value: matches[1] })
    createNodeField({ name: `featureImageSlug`, node, value: matches[2] })
  }
}

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
