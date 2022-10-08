import React, { useContext } from 'react'
import { graphql, Link } from 'gatsby'
import { MDXRenderer } from "gatsby-plugin-mdx"
// import { ModalRoutingContext } from 'gatsby-plugin-modal-routing-3'

import Header from '../components/Header'
import Footer from '../components/Footer'

export const Head = ({
  location,
  params,
  data,
  pageContext
}) => {

  let text, title, description, locationText
  if (data.mdx) {
    text = data.mdx
    title = text.frontmatter.title || text.fields.slug
    description = text.frontmatter.description
    locationText = `/${data.mdx.slug}/`
  }

  let pageTitle = data.site.siteMetadata.title
  if (title) {
    pageTitle = `${title} - ${pageTitle}`
  }

  const pageDescription = description ?
    description.replace(/<[^>]+>/g, '').trim() :
    data.site.siteMetadata.description

  const url = data.site.siteMetadata.siteUrl

  let siteImage = '/logo.png'
  let pageImage = `${url}${siteImage}`
  // if (image) {
  //   pageImage = image
  // }

  let pageLocation
  if (location) {
    if (location.href) {
      pageLocation = location.href
    } else {
      pageLocation = url + location.pathname
    }
  } else {
    pageLocation = data.site.siteMetadata.siteUrl
  }

  return (<>
    <title>{pageTitle}</title>
    <meta property="og:title" content={pageTitle} />
    <meta name="twitter:title" content={pageTitle} />
    <meta property="og:site_name" content={data.site.siteMetadata.title} />
    <meta property="og:type" content="website" />

    <meta name="description" content={pageDescription} />
    <meta property="og:description" content={pageDescription} />
    <meta name="twitter:description" content={pageDescription} />

    <link rel="canonical" href={pageLocation} />
    <meta property="og:url" content={pageLocation} />
    <meta name="twitter:url" content={pageLocation} />

    <meta name="author" content={data.site.siteMetadata.author} />
    <meta name="twitter:site" content="@lekevicius" />
    <meta name="twitter:creator" content="@lekevicius" />
    <link type="text/plain" rel="author" href="/humans.txt" />
 
    <meta property="og:image" content="/cover.jpg" />
    <meta name="twitter:image" content="/cover.jpg" />
    <meta name="twitter:card" content="summary_large_image" />

    <meta name="msapplication-TileColor" content="#333333" />
    <meta name="msapplication-TileImage" content="/tileicon.png" />

    <meta name="apple-mobile-web-app-title" content="Lekevicius" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
  </>)
}

{/* <head>
  <link rel="alternate" type="application/rss+xml" title="Journal Feed" href="/feed.xml">
</head> */}

const PageTemplate = (props) => {
  // const { modal, closeTo } = useContext(ModalRoutingContext)
  // console.log(props)
  const { data, children, path } = props

  const text = data.mdx
  const title = text.frontmatter.title || text.fields.slug
  const description = text.frontmatter.description
  const bodyclass = text.frontmatter.bodyclass

  let pathBodyClass = path.replace(/\//g, ' ').trim().replace(/ /g, '-')
  let bodyClass = bodyclass ? bodyclass : ''
  let bodyClassString = `${pathBodyClass} ${bodyClass}`.trim()

  // if (modal) {
  //   return (
  //     <Wrap location={`/${data.markdownRemark.fields.slug}/`} title={title} description={description}>
  //       <div className="max-w-[480px] lg:max-w-[1000px] mx-auto p-6 lg:p-16">
  //         <Link to={closeTo}>Close</Link>
  //         <h1 className="text-4xl font-bold">{title}</h1>
  //         { description && <p className="text-2xl mt-4">{description}</p> }
  //         <div className="mt-10 prose-sm xs:prose" dangerouslySetInnerHTML={{ __html: text.html }} />
  //       </div>
  //     </Wrap>
  //   )
  // }

  return (
    <div className={`pagewrap ${bodyClassString}`}>
      <div className="max-w-[480px] lg:max-w-[1000px] mx-auto">
        <Header isHome={false} data={data.site.siteMetadata} />

        {/* 
          TODO: deep logic needed: force-light, force-dark, and no based on dark:
          ${ bodyclass === 'force-dark' ? 'bg-slate-900 text-white' : 'bg-white' }
          ${ bodyclass === 'force-dark' ? 'prose-invert xs:prose-invert' : 'xs:prose' }
        */}
        <main className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white xs:rounded-3xl xs:shadow-lg w-full p-6 lg:p-16">
          {/* Featured image: pt-0 lg:pt-0 */}

          <h1 className="text-4xl font-bold">{title}</h1>
          { description && <p className="text-2xl mt-4">{description}</p> }

          <div className="mt-10 prose-sm xs:prose dark:prose-invert dark:xs:prose-invert">{children}</div>
        </main>

        <Footer />
      </div>
    </div>
  )
}

export default PageTemplate

export const pageQuery = graphql`
  query TextBySlug($slug: String!) {
    mdx(fields: { slug: { eq: $slug }}) {
      fields {
        slug
      }
      body
      frontmatter {
        title
        description
        bodyclass
      }
    }
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

// mdx(slug: {eq: $fileSlug}) {
//   body
// } $fileSlug: String!

// const isLink = !! text.frontmatter.link

// import SocialTwitter from '../components/graphics/SocialTwitter'
// import SocialFacebook from '../components/graphics/SocialFacebook'

// const renderAst = new rehypeReact({
//   createElement: React.createElement,
//   components: { "interactive-counter": Counter },
// }).Compiler


// location={this.props.location}
// title={article.frontmatter.title}
// description={article.excerpt}
// publishedAt={article.frontmatter.date}
// bodyClass={article.frontmatter.bodyclass}
// image={featureImage ? featureImage.publicURL : false}

// const featureImage = this.props.data.featureImage
// const { previous, next } = this.props.pageContext

// featureImage: file(fields: {
//   featureImageType: { eq: "journal" }
//   featureImageSlug: { eq: $slug }
// }) {
//   fields {
//     featureImageType
//     featureImageSlug
//   }
//   publicURL
// }
// }

// {
//   !isLink &&
//   (<div className="article-footer secondary">
//     <p>
//       If you liked this article, you should <a href="https://twitter.com/lekevicius">follow me on Twitter</a> or <a href="https://tinyletter.com/lekevicius/">subscribe to my low-volume newsletter</a>.
//       Or just share it with your friends, that would be very nice.
//     </p>
//     <ul className="unstyled share-links">
//       <li><a
//         href={`https://twitter.com/intent/tweet?text=${
//           encodeURI(this.props.data.markdownRemark.frontmatter.title)
//           }&amp;url=${this.props.location.href}&amp;via=lekevicius`}
//         onClick={(e) => {
//           e.preventDefault();
//           window.open(e.currentTarget.attributes.href.value, 'twitter-share', 'width=550,height=320');
//           return false;
//         }}
//       ><SocialTwitter /><span>Tweet</span></a></li>
//       <li><a
//         href={`https://www.facebook.com/sharer/sharer.php?u=${this.props.location.href}`}
//         onClick={(e) => {
//           e.preventDefault();
//           window.open(e.currentTarget.attributes.href.value, 'facebook-share','width=580,height=320');
//           return false;
//         }}
//       ><SocialFacebook /><span>Share</span></a></li>
//     </ul>
//   </div>)
// }

// <hr />
// <ul class="page-navigation">
//   <li>
//     {
//       previous &&
//       <Link to={previous.fields.journalPath} rel="prev">
//         ← Previous post
//       </Link>
//     }
//   </li>
//   <li>
//     {
//       next &&
//       <Link to={next.fields.journalPath} rel="next">
//         Next post →
//       </Link>
//     }
//   </li>
// </ul>

// <JournalSidebar minimal={isLink} />

// componentDidMount() {

//   if (!window.USER_CAN_TOUCH) {
//     window.addEventListener('touchstart', function onFirstTouch() {
//       window.USER_CAN_TOUCH = true
//       window.removeEventListener('touchstart', onFirstTouch, false)
//     }, false)
//   }
//   if (!window.USER_CAN_HOVER) {
//     window.addEventListener('mouseover', function onFirstHover() {
//       window.USER_CAN_HOVER = true
//       window.removeEventListener('mouseover', onFirstHover, false)
//     }, false)
//   }

//   let settings = {
//     debug: false,
//     margin: 16
//     // FUTURE pass various selectors as props
//   }
//   const parser = new DOMParser()

//   function getCoords(elem) {
//     let box = elem.getBoundingClientRect()
//     return {
//       top: box.top + window.pageYOffset,
//       left: box.left + window.pageXOffset
//     }
//   }

//   const $1 = document.querySelector.bind(document)
//   const $A = document.querySelectorAll.bind(document)

//   let mouseoverTimeout = false

//   const onFootnoteOver = (e) => {
//     clearTimeout(mouseoverTimeout)
//     if ($1('#footnote-popover')) $1('#footnote-popover').remove()

//     const linkId = e.currentTarget.hash.substring(1)
//     if ($1(`[id="${ linkId }"]`)) {
//       const footnoteContent = $1(`[id="${ linkId }"]`).innerHTML

//       const footnoteEl = parser
//       .parseFromString(`<div id="footnote-popover"><div class="footnote-text">${footnoteContent}</div></div>`, "text/html")
//       .querySelector('div#footnote-popover')

//       let closeLink
//       if (window.USER_CAN_TOUCH) {
//         e.preventDefault()
//         closeLink = parser
//         .parseFromString(`<a href ="#" class="close">&times;</a>`, "text/html")
//         .querySelector('a')

//         closeLink.addEventListener('click', function closePopover(e) {
//           e.preventDefault()
//           if ($1('#footnote-popover')) $1('#footnote-popover').remove()
//         }, true)
//       }

//       footnoteEl.addEventListener('mouseover', onFootnotePopoverOver)
//       footnoteEl.addEventListener('mouseout', onFootnoteOut)
//       document.body.append(footnoteEl)

//       const popoverWidth = Math.min(window.innerWidth - settings.margin * 2, 500)
//       const popoverHeight = Math.min(window.innerHeight - settings.margin * 2, 312)

//       footnoteEl.style.maxWidth = `${popoverWidth}px`
//       footnoteEl.style.maxHeight = `${popoverHeight}px`

//       const elPosition = getCoords(e.currentTarget)
//       const actualWidth = footnoteEl.offsetWidth
//       const actualHeight = footnoteEl.offsetHeight
      
//       let popoverX = elPosition.left
//       // window.innerWidth + window.scrollX is a coordinate for right of the window
//       // If popover would go out of that bound...
//       if (popoverX + settings.margin + actualWidth > window.innerWidth + window.scrollX) {
//         // if can't fit at all, center
//         if (settings.margin * 2 + actualWidth > window.innerWidth) {
//           popoverX = (window.innerWidth - actualWidth - settings.margin * 2) / 2.0 - settings.margin
//         } else {
//           // if can't show to the right, will show to the left
//           popoverX -= actualWidth - settings.margin
//           // if pushed too far, move back right
//           if (popoverX < settings.margin) popoverX = settings.margin 
//         }
//       }

//       let popoverY = elPosition.top + 24
//       // window.innerHeight + window.scrollY is a coordinate for bottom of the window
//       // If popover would go out of that bound, show it above instead of below.
//       if (popoverY + actualHeight + settings.margin > window.innerHeight + window.scrollY){
//         if (elPosition.top - actualHeight - 8 < window.scrollY) {
//           popoverY = window.scrollY + settings.margin
//           popoverX += 16
//         } else {
//           popoverY = elPosition.top - actualHeight - 8
//         }
//       }

//       footnoteEl.style.top = `${popoverY}px`
//       footnoteEl.style.left = `${popoverX}px`
//       if (window.USER_CAN_TOUCH) footnoteEl.prepend(closeLink)
//     }
//   }

//   const onFootnoteOut = () => {
//     mouseoverTimeout = setTimeout(() => { if($1('#footnote-popover')) $1('#footnote-popover').remove() }, 200)
//   }

//   const onFootnotePopoverOver = () => clearTimeout(mouseoverTimeout)

//   const footnotePopover = (el) => {
//     el.removeEventListener('mouseover', onFootnoteOver, false)
//     el.removeEventListener('mouseout', onFootnoteOut, false)
//     el.addEventListener('mouseover', onFootnoteOver, false)
//     el.addEventListener('mouseout', onFootnoteOut, false)

//     el.removeEventListener('click', onFootnoteOver, true)
//     el.addEventListener('click', onFootnoteOver, true)
//   }

//   const setupFootnotePopover = (els, options = {}) => {
//     settings = extend(settings, options)
//     for (const el of els) {
//       footnotePopover(el)
//     }
//   }
//   setupFootnotePopover($A('a.footnote-ref'))

// }

// <div className={ `content-layout journal-content journal-entry` }>
// <div className="content">
//   <article className={ `h-entry article ${ isLink ? 'article-link' : 'article-article' }` } key={article.fields.slug}>
//     { isLink ?
//       (<>
//         <h1 className="p-name article-title">
//           <a href={article.frontmatter.link}>{title}</a>
//         </h1>
//         <p className="secondary byline">
//           <span className="article-date">Published on <time className="dt-published">{formattedDate}</time></span>
//         </p>
//       </>) :
//       (<>
//         <h1 className="p-name article-title">{title}</h1>
//         <p className="secondary byline">
//           <span className="article-date">Published on <time className="dt-published">{formattedDate}</time></span>
//           <span className="reading-time">
//             Reading time: {`${article.timeToRead} minute${ article.timeToRead > 1 ? 's':'' }`}
//           </span>
//         </p>
//       </>)
//     }
//     <div className="e-content">{ renderAst(article.htmlAst) }</div>
//   </article>
// </div>
// </div>
