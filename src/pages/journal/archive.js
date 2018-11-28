import React from 'react'
import { Link, graphql } from 'gatsby'
import { get, orderBy, groupBy } from 'lodash'
import Helmet from 'react-helmet'
import moment from 'moment'

import JournalSidebar from "../../components/JournalSidebar"

import Layout from '../../templates/Layout'
import './archive.css'

class JournalArchive extends React.Component {
  render() {
    const posts = get(this, 'props.data.allMarkdownRemark.edges')

    const months = groupBy(posts, (p) => moment(p.node.frontmatter.date).format('YYYY-MM'))
    const monthKeys = Object.keys(months).sort().reverse()

    return (
      <Layout location={this.props.location} title="Journal Archive">
        <div className="page-header">
          <h1>Journal Archive</h1>
          <p>All posts and links by date.</p>
        </div>
        <div className={ `content-layout journal-content journal-archive-page` }>
          <div className={ `content` }>
          {monthKeys.map((month) => {
            const monthPosts = months[month];
            const readableMonth = moment(month, 'YYYY-MM').format('YYYY MMMM')
            return (
              <div key={month}>
              <h2>{readableMonth}</h2>
              <ul className="unstyled archive-list">
              {monthPosts.map(({ node: post }, index) => {
                const skipDay = (index > 0 &&
                  moment(post.frontmatter.date).format('DD') === 
                  moment(monthPosts[index - 1].node.frontmatter.date).format('DD'))
                return (
                  <li
                    className={ `post ${ post.frontmatter.link ? ' post-link' : ' post-article' }` }
                    key={post.fields.journalPath}>
                    <span className={`post-date ${ skipDay ? ' skip' : '' }`}>
                      { moment(post.frontmatter.date).format('DD') }
                    </span>
                    <h3 className="post-title">
                      <Link to={post.fields.journalPath}>{post.frontmatter.title}</Link>
                    </h3>
                  </li>
                )
              })}
              </ul>
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

export default JournalArchive

export const pageQuery = graphql`
  {
    allMarkdownRemark(
      sort: { fields: [frontmatter___date], order: DESC }
      filter: {
        fileAbsolutePath: {
          glob: "**/journal/**"
        }
      }
      limit: 1000
    ) {
      edges {
        node {
          fields {
            journalPath
          }
          frontmatter {
            date
            title
            link
          }
        }
      }
    }
  }
`
