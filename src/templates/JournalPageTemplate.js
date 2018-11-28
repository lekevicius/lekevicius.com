import React from 'react'
import { Link, graphql } from 'gatsby'
import get from 'lodash/get'
import Helmet from 'react-helmet'

import rehypeReact from "rehype-react"
import JournalSidebar from "../components/JournalSidebar"

import Layout from './Layout'

class JournalPageTemplate extends React.Component {
  render() {
    const posts = get(this, 'props.data.allMarkdownRemark.edges')

    const renderAst = new rehypeReact({
      createElement: React.createElement
    }).Compiler

    return (
      <Layout location={this.props.location} title="Journal">
        {
          this.props.pageContext.page === 0 &&
          <div className="page-header">
            <h1>Journal</h1>
            <p>Articles and links about design, technology and media.</p>
          </div>
        }
        <div className={ `content-layout journal-content journal-page ${ this.props.pageContext.page === 0 ? 'first-page' : '' }` }>
          <div className={ `content` }>
            {posts.map(({ node: post }) => {
              const title = get(post, 'frontmatter.title') || post.fields.slug
              const isLink = !! post.frontmatter.link
              return (
                <div className={ `post ${ isLink ? 'post-link' : 'post-article' }` } key={post.fields.slug}>
                  { isLink ? 
                    (<>
                      <h3 className="post-title">
                        <a href={post.frontmatter.link}>{title}</a>
                      </h3>
                      <p className="secondary byline">
                        <span className="post-date">{post.frontmatter.date}</span>
                        <Link to={post.fields.journalPath} className="permalink">Permalink</Link>
                      </p>
                    </>) :
                    (<>
                      <h3 className="post-title">
                        <Link to={post.fields.journalPath}>{title}</Link>
                      </h3>
                      <p className="secondary byline">
                        <span className="post-date">{post.frontmatter.date}</span>
                        <span className="reading-time">Reading time: {`${post.timeToRead} minute${ post.timeToRead > 1 ? 's':'' }`}</span>
                        <Link to={post.fields.journalPath} className="permalink">Permalink</Link>
                      </p>
                    </>)
                  }
                  { renderAst(post.htmlAst) }
                </div>
              )
            })}

            <ul className="page-navigation">
              <li>
                {
                  (this.props.pageContext.page < this.props.pageContext.totalPages - 1) &&
                  <Link to={`/journal/page/${this.props.pageContext.page + 2}`} rel="next">
                    ← Previous posts
                  </Link>
                }
              </li>
              <li>
                {
                  (this.props.pageContext.page > 0) &&
                  <Link to={
                    this.props.pageContext.page === 1 ?
                    `/journal/` :
                    `/journal/page/${this.props.pageContext.page}`} rel="prev">
                    Newer posts →
                  </Link>
                }
              </li>
            </ul>
          </div>
          <JournalSidebar />
        </div>
      </Layout>
    )
  }
}

export default JournalPageTemplate

export const pageQuery = graphql`
  query($skip: Int!, $limit: Int!) {
    allMarkdownRemark(
      sort: { fields: [frontmatter___date], order: DESC }
      limit: $limit
      skip: $skip
      filter: {
        fileAbsolutePath: {
          glob: "**/journal/**"
        }
      }
    ) {
      edges {
        node {
          htmlAst
          fields {
            slug
            journalPath
          }
          timeToRead
          frontmatter {
            date(formatString: "MMMM Do, YYYY")
            title
            link
          }
        }
      }
    }
  }
`
