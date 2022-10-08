import * as React from "react"
import Feed from '../components/Feed'
import { graphql } from "gatsby"

export { Head } from '../templates/PageTemplate'

const IndexPage = ({data}) => {
  return (
    <Feed data={data} />
  )
}

export default IndexPage

export const pageQuery = graphql`
  query SiteInfo {
    site {
      siteMetadata {
        author
        title
        description
        siteUrl
        shoutout
      }
    }
  }
`