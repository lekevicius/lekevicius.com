import React from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'
import { StaticQuery, graphql } from 'gatsby'

import Header from '../components/Header'
import './Fonts.css'
import './Base.css'
import './Layout.css'

import './Journal.css'
import './Project.css'

// import appleTouchIcon76 from '../assets/icons/apple-touch-icon-76x76.png'
// import appleTouchIcon120 from '../assets/icons/apple-touch-icon-120x120.png'
// import appleTouchIcon152 from '../assets/icons/apple-touch-icon-152x152.png'
// import appleTouchIcon180 from '../assets/icons/apple-touch-icon-180x180.png'
// import favicon from '../assets/icons/favicon.ico'
// import tileIcon from '../assets/icons/tileicon.png'
import siteImage from '../assets/images/site-image.png'

class Layout extends React.Component {
  render() {
    let pathBodyClass = this.props.location.pathname.replace(/\//g, ' ').trim().replace(/ /g, '-')
    let backgroundColor = this.props.bodyBackground ? this.props.bodyBackground : null
    let bodyClass = this.props.bodyClass ? this.props.bodyClass : ''
    const isArticle = !! this.props.publishedAt

    const image = this.props.image ? this.props.image : siteImage

    return (
      <StaticQuery
        query={graphql`
          query SiteTitleQuery {
            site {
              siteMetadata {
                author
                title
                description
                siteUrl
              }
            }
          }
        `}
        render={ data => {
          let title = data.site.siteMetadata.title
          if (this.props.title) {
            title = `${this.props.title} ${this.props.publishedAt ? 'by' : '-'} ${title}`
          }

          const description = this.props.description ? 
            this.props.description.replace(/<[^>]+>/g, '').trim() : 
            data.site.siteMetadata.description

          const url = data.site.siteMetadata.siteUrl

          let location
          if (this.props.location) {
            if (this.props.location.href) {
              location = this.props.location.href
            } else {
              location = url + this.props.location.pathname
            }
          } else {
            location = data.site.siteMetadata.siteUrl
          }

          return (<>
            <Helmet defer={false}>
              <html lang="en" dir="ltr" prefix="og: http://ogp.me/ns# article: http://ogp.me/ns/article#" />

              <title>{title}</title>
              <meta property="og:title" content={title} />
              <meta name="twitter:title" content={title} />
              <meta property="og:site_name" content={data.site.siteMetadata.title} />

              <meta name="description" content={description} />
              <meta property="og:description" content={description} />
              <meta name="twitter:description" content={description} />

              <link rel="canonical" href={location} />
              <meta property="og:url" content={location} />
              <meta name="twitter:url" content={location} />
              
              <meta name="author" content={data.site.siteMetadata.author} />
              <meta name="twitter:site" content="@lekevicius" />
              <meta name="twitter:creator" content="@lekevicius" />
              <link type="text/plain" rel="author" href={`${url}/humans.txt`} />

              <meta property="og:image" content={`${url}${image}`} />
              <meta name="twitter:image" content={`${url}${image}`} />

              { !isArticle && <meta property="og:type" content="website" /> }
              { isArticle && <meta property="og:type" content="article" /> }
              { isArticle && <meta property="article:published_time" content={this.props.publishedAt} /> }
              { isArticle && <meta property="article:author" content="https://lekevicius.com/profile" /> }
              <meta name="twitter:card" content="summary_large_image" />

              <meta name="msapplication-TileColor" content="#333333" />
              <meta name="msapplication-TileImage" content="/tileicon.png" />

              <meta name="apple-mobile-web-app-title" content="Lekevicius" />
              <meta name="apple-mobile-web-app-capable" content="yes" />

              <body class={`${pathBodyClass} ${bodyClass}`.trim()} />

              { backgroundColor &&
                <style type="text/css">{`
                  :root { --body-background: ${backgroundColor} !important; }
                `}</style>
              }
            </Helmet>

            <Header
              siteTitle={data.site.siteMetadata.title}
              location={this.props.location}
              headerBackground={this.props.headerBackground}
              headerText={this.props.headerText}
            />
            <main>
              {this.props.children}
            </main>
          </>)
        }}
      />
    )
  }
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
