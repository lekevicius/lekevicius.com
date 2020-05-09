import React from 'react'
import Img from "gatsby-image"
import { get } from 'lodash'
import { graphql } from 'gatsby'

import rehypeReact from "rehype-react"
import Counter from "../components/Counter"

import Layout from './Layout'

class ProjectTemplate extends React.Component {
  render() {
    const project = this.props.data.markdownRemark
    const featureImage = this.props.data.featureImage

    const fixedImagesBySlug = {}
    const images = get(this, 'props.data.allFile.edges')
    images.map(({ node }) => {
      const imageMatch = node.absolutePath.match(/\/projects\/([a-z0-9-]+)\/project-image/)
      if (imageMatch) {
        fixedImagesBySlug[imageMatch[1]] = node.childImageSharp.fixed
      }
      return null
    })
    const projectIcon = fixedImagesBySlug[project.fields.slug]

    const headDescription = project.frontmatter.pageDescription ? 
    project.frontmatter.pageDescription : 
    (
      project.frontmatter.description ?
      project.frontmatter.description :
      "Project by Jonas Lekevicius"
    )

    let bodyclass = project.frontmatter.bodyclass ? project.frontmatter.bodyclass : ''
    bodyclass = `project-page ${bodyclass}`.trim()

    const renderAst = new rehypeReact({
      createElement: React.createElement,
      components: { "interactive-counter": Counter },
    }).Compiler

    return (
      <Layout
        location={this.props.location}
        title={project.frontmatter.title}
        description={headDescription}
        bodyClass={bodyclass}
        image={featureImage ? featureImage.publicURL : false}
        >

        <div className="page-header">
          <div className="page-header-icon">
            <Img fixed={projectIcon} />
          </div>
          <div className="page-header-text">
            <h1>{project.frontmatter.title}</h1>
            { project.frontmatter.pageDescription &&
              <p className="page-lead">{project.frontmatter.pageDescription}</p>
            }
          </div>
        </div>
        <div className="content-layout">
          <div className="content">
            { renderAst(project.htmlAst) }
          </div>
        </div>
      </Layout>
    )
  }
}

export default ProjectTemplate

export const pageQuery = graphql`
  query ProjectByPath($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      htmlAst
      fields {
        slug
        projectPath
      }
      frontmatter {
        title
        description
        bodyclass
        pageDescription
      }
    }
    featureImage: file(fields: {
      featureImageType: { eq: "projects" }
      featureImageSlug: { eq: $slug }
    }) {
      fields {
        featureImageType
        featureImageSlug
      }
      publicURL
    }
    allFile(filter: {
      absolutePath: {
        glob: "**/projects/*/project-image.png"
      }
    }) {
      edges {
        node {
          absolutePath
          childImageSharp {
            fixed(width: 128) {
              base64
              aspectRatio
              width
              height
              src
              srcSet
              originalName
            }
          }
        }
      }
    }
  }
`
