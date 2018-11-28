import React from 'react'
import { Link, graphql } from 'gatsby'
import Img from "gatsby-image"
import { get, orderBy } from 'lodash'
import Helmet from 'react-helmet'

import Layout from '../templates/Layout'
import './projects.css'

import clientCocaCola from './projects/logos/cocacola.svg'
import clientHitachi from './projects/logos/hitachi.svg'
import clientBrusselsAirlines from './projects/logos/brusselsairlines.svg'
import clientBarclays from './projects/logos/barclays.svg'

const groupInfo = {
  'projects': {
    name: 'Projects',
    description: 'Currently my focus is on designing and developing useful and delightful apps. This section contains projects I have released, both recently and in the past. My most successful one, Infinite Loop game, was sold in 2016 and I no longer maintain it.'
  },
  'open-source': {
    name: 'Open Source',
    description: 'Occasionally I build something useful and release it on <a href="https://github.com/lekevicius">GitHub</a>. I’m not a very consistent maintainer of these projects, but stars and follows are always appreciated and motivating. This website is also <a href="https://github.com/lekevicius/lekevicius.com">open sourced</a>.'
  },
  'hacks': {
    name: 'Smaller hacks',
    description: 'I love playing with new tech and shipping smaller, even if not perfectly polished hacks. These are by no means “products”. Some are artistic or more conceptual, others were built just because I could.'
  },
  'studies': {
    name: 'Study projects',
    description: 'I have studied in <a href="https://www.baaa.dk/programmes/ap-degree/multimedia-design/">Business Academy Aarhus</a> (AP, Multimedia Design) and <a href="http://www.vda.lt/en/study_programs/undergraduate-ba/graphic-design/graphic-design-undergraduate-vilnius/">Vilnius Academy of Arts</a> (BA, Graphic Design). This section contains a few of the more interesting works I did as study projects. Sound Shapes in particular grew from a pretty small study project to a profit-generating venture.'
  },

  'lemon-labs': {
    name: 'Works at Lemon Labs',
    description: 'Love forever'
  }
}
const groupKeys = Object.keys(groupInfo)
const groupKeyIndex = {}
groupKeys.map((val, idx) => groupKeyIndex[val] = idx)

class ProjectsPage extends React.Component {
  render() {
    const siteTitle = get(this, 'props.data.site.siteMetadata.title')
    const siteDescription = get(
      this,
      'props.data.site.siteMetadata.description'
    )
    const groups = get(this, 'props.data.allMarkdownRemark.group')

    const fixedImagesBySlug = {}
    const images = get(this, 'props.data.allFile.edges')
    images.map(({ node }) => {
      const imageMatch = node.absolutePath.match(/\/projects\/([a-z0-9-]+)\/project-image/)
      if (imageMatch) {
        fixedImagesBySlug[imageMatch[1]] = node.childImageSharp.fixed
      }
    })

    return (
      <Layout location={this.props.location} title="Projects">
        {
          orderBy(groups, (g) => groupKeyIndex[g.fieldValue] ? groupKeyIndex[g.fieldValue] : -1)
          .map((group) => {
            const groupTitle = group.fieldValue
            return (
              <div className="project-group" key={group.fieldValue}>
                <h4 className="section-title">{groupInfo[groupTitle].name}</h4>
                {
                  groupInfo[groupTitle].description &&
                  <div className="content-layout">
                    <div className="content">
                      <p className="intro secondary" dangerouslySetInnerHTML={{ __html: groupInfo[groupTitle].description }} />
                    </div>
                  </div>
                }
                <ul className="project-list">
                {
                  orderBy(group.edges, (e) => e.node.frontmatter.order)
                  .map(({ node }) => {
                    return (
                      <li key={node.frontmatter.title}>
                        <Link to={node.fields.projectPath}>
                          <Img fixed={fixedImagesBySlug[node.fields.slug]} />
                          <h3>{node.frontmatter.title}</h3>
                          <p className="secondary">{node.frontmatter.description}</p>
                        </Link>
                      </li>
                    )
                  })
                }
                </ul>
              </div>
            )
          })
        }
        <div className="project-group client-logos">
          <h4 className="section-title">Notable clients</h4>
          <div className="content-layout"><div className="content"><p className="intro secondary">
            I have been doing client work of all kinds — websites, apps, games, magazines, videos — for over 10 years. Currently I am not available for any freelance or contract work. However, I would like to mention a couple of clients that I had pleasure to work with.
          </p></div></div>
          <ul className="project-list">
            <li><img src={clientCocaCola} /></li>
            <li><img src={clientHitachi} /></li>
            <li><img src={clientBrusselsAirlines} /></li>
            <li><img src={clientBarclays} /></li>
          </ul>
        </div>
      </Layout>
    )
  }
}

export default ProjectsPage

export const pageQuery = graphql`
  query {
    allMarkdownRemark(filter: {
      fileAbsolutePath: {
        glob: "**/projects/**"
      }
    }) {
      group(field: frontmatter___group) {
        fieldValue
        edges {
          node {
            id
            fields {
              slug
              projectPath
            }
            frontmatter {
              title
              description
              group
              order
            }
          }
        }
      }
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
