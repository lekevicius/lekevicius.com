import React from 'react'
import { Link, graphql } from 'gatsby'

import Layout from '../templates/Layout'

class NowPage extends React.Component {
  render() {
    const now = this.props.data.allMarkdownRemark.edges[0].node

    return (
      <Layout location={this.props.location} title="Now">
        <div className="page-header">
          <h1>Now</h1>
          <p className="page-lead">Snapshot of my life right now.</p>
        </div>
        <div className="content-layout">
        <div className="content">
          <div dangerouslySetInnerHTML={{__html: now.html}}></div>
          <p className="secondary">This is my <a href="https://nownownow.com/about">now</a> page. Visit my <Link to="/profile/">Profile page</Link> to read more about me or contact me.</p>
        </div>
        </div>
      </Layout>
    )
  }
}

export default NowPage

export const pageQuery = graphql`
  query {
  allMarkdownRemark(
    filter: {
      fileAbsolutePath: {
        glob: "**/now.md"
      }
    }
    limit: 1
  ) {
    edges {
      node {
        html
      }
    }
  }
}
`
