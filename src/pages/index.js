import React from 'react'
import { Link, graphql } from 'gatsby'
import Img from "gatsby-image"
import { get, keyBy } from 'lodash'

import Layout from '../templates/Layout'
import './index.css'

class HomePage extends React.Component {
  render() {
    const journalArticles = get(this, 'props.data.journalArticles.edges')
    // const journalLinks = get(this, 'props.data.journalLinks.edges')
    const projectInfo = get(this, 'props.data.projectInfo.edges')
    const projectImages = get(this, 'props.data.projectImages.edges')

    const featuredProjects = ['timeful', 'cryptoproof', 'october30']
    const projectInfoMap = keyBy(projectInfo, ({ node }) => node.fields.slug)
    const projectImageMap = keyBy(projectImages, ({ node }) => 
      node.absolutePath.match(/\/projects\/([a-z0-9-]+)\/feature-image.png/)[1])
    
    return (
      <Layout location={this.props.location} bodyClass="homepage">
        <div className="intro-text">
          <h3>I design and build digital things.</h3>
          <p>Previously I co-founded Lemon Labs app design and development agency, worked as head of product design at Treatwell and created Infinite Loop game. Now, building new things and seeing where it leads me.</p>
        </div>
        <section className="home-projects">
          <h4 className="section-title"><span>Recent projects</span> <Link to="/projects">View all projects</Link></h4>

          <ul className="home-project-list">
            {
              featuredProjects.map((key) => {
                const info = projectInfoMap[key]
                const image = projectImageMap[key]
                return (
                  <li key={key}>
                    <Link to={info.node.fields.projectPath}>
                      <Img fluid={image.node.childImageSharp.fluid} />
                      <h3>{info.node.frontmatter.title}</h3>
                      <p className="secondary">{info.node.frontmatter.description}</p>
                    </Link>
                  </li>
                )
              })
            }
          </ul>
        </section>

        <section className="home-journal content-layout">
          <div className="content">
            <h4 className="section-title"><span>Recent articles</span> <Link to="/journal">Read journal</Link></h4>

            <ul className="home-article-list">
              {
                journalArticles.map(({ node }) => {
                  const cleanText = node.excerpt.replace(/<[^>]+>/g, '')
                  return (
                    <li key={node.fields.journalPath}>
                      <Link to={node.fields.journalPath}>
                        <h3>{node.frontmatter.title}</h3>
                        <p className="secondary">{cleanText}</p>
                      </Link>
                    </li>
                  )
                })
              }
            </ul>
          </div>
        </section>
      </Layout>
    )
  }
}

export default HomePage

const featuredProjects = ['timeful', 'cryptoproof', 'october30']
const featuredRegex = featuredProjects.join('|')

const projectInfoRegex = `/[a-zA-Z0-9/]+/projects/(${featuredRegex}).md/`
const projectImageRegex = `/[a-zA-Z0-9/]+/projects/(${featuredRegex})/feature-image.png/`

export const pageContext = {
  projectInfoRegex,
  projectImageRegex
}

export const pageQuery = graphql`
  query {
    projectInfo: allMarkdownRemark(
      filter: {
        fileAbsolutePath: {
          regex: "/[a-zA-Z0-9/]+/projects/(timeful|cryptoproof|october30).md/"
        }
      }
    ) {
      edges {
        node {
          fields {
            slug
            projectPath
          }
          frontmatter {
            title
            description
          }
        }
      }
    }
    projectImages: allFile(filter: {
      fields: {
        featureImageType: { eq: "projects" }
        featureImageSlug: {
          in: ["timeful", "cryptoproof", "october30"]
        }
      }
    }) {
      edges {
        node {
          absolutePath
          childImageSharp {
            fluid(maxWidth: 480) {
              base64
              aspectRatio
              src
              srcSet
              sizes
              originalImg
              originalName
              presentationWidth
              presentationHeight
            }
          }
        }
      }
    }
    journalArticles: allMarkdownRemark(
      sort: { 
        fields: [frontmatter___date], 
        order: DESC
      }
      filter: {
        fileAbsolutePath: {
          glob: "**/journal/**"
        }
        frontmatter: {
          link: { eq: null }
        }
      }
      limit: 3
    ) {
      edges {
        node {
          fields {
            journalPath
          }
          frontmatter {
            date
            title
          }
          excerpt
        }
      }
    }
    journalLinks: allMarkdownRemark(
      sort: { 
        fields: [frontmatter___date], 
        order: DESC
      }
      filter: {
        fileAbsolutePath: {
          glob: "**/journal/**"
        }
        frontmatter: {
          link: { ne: null }
        }
      }
      limit: 5
    ) {
      edges {
        node {
          fields {
            journalPath
          }
          frontmatter {
            link
            date
            title
          }
          excerpt
        }
      }
    }
  }


`
