import React from 'react'
import { Link, graphql } from 'gatsby'
import { get, keyBy, groupBy } from 'lodash'
import Img from "gatsby-image"
import moment from 'moment'

import JournalSidebar from "../../components/JournalSidebar"

import Layout from '../../templates/Layout'
import './archive.css'

class JournalArticles extends React.Component {
  render() {
    const posts = get(this, 'props.data.articles.edges')
    const articleImages = get(this, 'props.data.articleImages.edges')
    const articleImageMap = keyBy(articleImages, ({ node }) => node.fields.featureImageSlug)

    const years = groupBy(posts, (p) => moment(p.node.frontmatter.date).format('YYYY'))
    const yearKeys = Object.keys(years).sort().reverse()

    return (
      <Layout location={this.props.location} title="Articles">
        <div className="page-header">
          <h1>Journal Articles</h1>
          {/* <p>Just the full articles in my journal.</p> */}
        </div>
        <div className={ `content-layout journal-content journal-articles-page` }>
          <div className={ `content` }>
          {yearKeys.map((year) => {
            const yearPosts = years[year];
            return (
              <div key={year}>
              <h2>{year}</h2>
              {yearPosts.map(({ node: post }) => {
                const image = articleImageMap[post.fields.slug]
                const cleanText = post.excerpt.replace(/<[^>]+>/g, '')
                return (
                  <Link to={post.fields.journalPath}>
                  <div className="post" key={post.fields.journalPath}>
                    <Img fluid={image.node.childImageSharp.fluid} />
                    <div className="post-text">
                      <span className="post-date secondary">{moment(post.frontmatter.date).format('MMMM Do')}</span>
                      <h3 className="post-title">
                        {post.frontmatter.title}
                      </h3>
                      <p className="secondary">{cleanText}</p>
                    </div>
                  </div>
                  </Link>
                )
              })}
              </div>
            )
          })}
          </div>
          <JournalSidebar />
        </div>
      </Layout>
    )
  }
}

export default JournalArticles

export const pageQuery = graphql`
  {
    articleImages: allFile(filter: {
      fields: {
        featureImageType: { eq: "journal" }
      }
    }) {
      edges {
        node {
          absolutePath
          fields {
            featureImageSlug
          }
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
    articles: allMarkdownRemark(
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
      limit: 1000
    ) {
      edges {
        node {
          fields {
            slug
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
  }
`
