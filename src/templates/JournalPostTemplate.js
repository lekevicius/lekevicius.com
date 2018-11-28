import React from 'react'
import Helmet from 'react-helmet'
import { Link, graphql } from 'gatsby'
import moment from 'moment'
import { extend } from 'lodash'

import rehypeReact from "rehype-react"
import Counter from "../components/Counter"
import JournalSidebar from "../components/JournalSidebar"
import SocialTwitter from '../components/graphics/SocialTwitter'
import SocialFacebook from '../components/graphics/SocialFacebook'

import get from 'lodash/get'

import Layout from './Layout'

class JournalPostTemplate extends React.Component {
  componentDidMount() {

    if (!window.USER_CAN_TOUCH) {
      window.addEventListener('touchstart', function onFirstTouch() {
        window.USER_CAN_TOUCH = true
        window.removeEventListener('touchstart', onFirstTouch, false)
      }, false)
    }
    if (!window.USER_CAN_HOVER) {
      window.addEventListener('mouseover', function onFirstHover() {
        window.USER_CAN_HOVER = true
        window.removeEventListener('mouseover', onFirstHover, false)
      }, false)
    }

    let settings = {
      debug: false,
      margin: 16
      // FUTURE pass various selectors as props
    }
    const parser = new DOMParser()

    function getCoords(elem) {
      let box = elem.getBoundingClientRect()
      return {
        top: box.top + pageYOffset,
        left: box.left + pageXOffset
      }
    }

    const $1 = document.querySelector.bind(document)
    const $A = document.querySelectorAll.bind(document)

    let mouseoverTimeout = false

    const onFootnoteOver = (e) => {
      clearTimeout(mouseoverTimeout)
      if ($1('#footnote-popover')) $1('#footnote-popover').remove()

      const linkId = e.currentTarget.hash.substring(1)
      if ($1(`[id="${ linkId }"]`)) {
        const footnoteContent = $1(`[id="${ linkId }"]`).innerHTML

        const footnoteEl = parser
        .parseFromString(`<div id="footnote-popover"><div class="footnote-text">${footnoteContent}</div></div>`, "text/html")
        .querySelector('div#footnote-popover')

        let closeLink
        if (window.USER_CAN_TOUCH) {
          e.preventDefault()
          closeLink = parser
          .parseFromString(`<a href ="#" class="close">&times;</a>`, "text/html")
          .querySelector('a')

          closeLink.addEventListener('click', function closePopover(e) {
            e.preventDefault()
            if ($1('#footnote-popover')) $1('#footnote-popover').remove()
          }, true)
        }

        footnoteEl.addEventListener('mouseover', onFootnotePopoverOver)
        footnoteEl.addEventListener('mouseout', onFootnoteOut)
        document.body.append(footnoteEl)

        const popoverWidth = Math.min(window.innerWidth - settings.margin * 2, 500)
        const popoverHeight = Math.min(window.innerHeight - settings.margin * 2, 312)

        footnoteEl.style.maxWidth = `${popoverWidth}px`
        footnoteEl.style.maxHeight = `${popoverHeight}px`

        const elPosition = getCoords(e.currentTarget)
        const actualWidth = footnoteEl.offsetWidth
        const actualHeight = footnoteEl.offsetHeight
        
        let popoverX = elPosition.left
        // window.innerWidth + window.scrollX is a coordinate for right of the window
        // If popover would go out of that bound...
        if (popoverX + settings.margin + actualWidth > window.innerWidth + window.scrollX) {
          // if can't fit at all, center
          if (settings.margin * 2 + actualWidth > window.innerWidth) {
            popoverX = (window.innerWidth - actualWidth - settings.margin * 2) / 2.0 - settings.margin
          } else {
            // if can't show to the right, will show to the left
            popoverX -= actualWidth - settings.margin
            // if pushed too far, move back right
            if (popoverX < settings.margin) popoverX = settings.margin 
          }
        }

        let popoverY = elPosition.top + 24
        // window.innerHeight + window.scrollY is a coordinate for bottom of the window
        // If popover would go out of that bound, show it above instead of below.
        if (popoverY + actualHeight + settings.margin > window.innerHeight + window.scrollY){
          if (elPosition.top - actualHeight - 8 < window.scrollY) {
            popoverY = window.scrollY + settings.margin
            popoverX += 16
          } else {
            popoverY = elPosition.top - actualHeight - 8
          }
        }

        footnoteEl.style.top = `${popoverY}px`
        footnoteEl.style.left = `${popoverX}px`
        if (window.USER_CAN_TOUCH) footnoteEl.prepend(closeLink)
      }
    }

    const onFootnoteOut = () => {
      mouseoverTimeout = setTimeout(() => { if($1('#footnote-popover')) $1('#footnote-popover').remove() }, 200)
    }

    const onFootnotePopoverOver = () => clearTimeout(mouseoverTimeout)

    const footnotePopover = (el) => {
      el.removeEventListener('mouseover', onFootnoteOver, false)
      el.removeEventListener('mouseout', onFootnoteOut, false)
      el.addEventListener('mouseover', onFootnoteOver, false)
      el.addEventListener('mouseout', onFootnoteOut, false)

      el.removeEventListener('click', onFootnoteOver, true)
      el.addEventListener('click', onFootnoteOver, true)
    }

    const setupFootnotePopover = (els, options = {}) => {
      settings = extend(settings, options)
      for (const el of els) {
        footnotePopover(el)
      }
    }
    setupFootnotePopover($A('a.footnote-ref'))

  }
  render() {
    const post = this.props.data.markdownRemark
    const featureImage = this.props.data.featureImage
    // const { previous, next } = this.props.pageContext

    const renderAst = new rehypeReact({
      createElement: React.createElement,
      components: { "interactive-counter": Counter },
    }).Compiler

    const title = get(post, 'frontmatter.title') || post.fields.slug
    const isLink = !! post.frontmatter.link

    const formattedDate = moment(post.frontmatter.date).format("MMMM Do, YYYY")

    return (
      <Layout
        location={this.props.location}
        title={post.frontmatter.title}
        description={post.excerpt}
        publishedAt={post.frontmatter.date}
        bodyClass={post.frontmatter.bodyclass}
        image={featureImage ? featureImage.publicURL : false}
        >

        <div className={ `content-layout journal-content journal-entry` }>
          <div className="content">
            <article className={ `h-entry post ${ isLink ? 'post-link' : 'post-article' }` } key={post.fields.slug}>
              { isLink ? 
                (<>
                  <h1 className="p-name post-title">
                    <a href={post.frontmatter.link}>{title}</a>
                  </h1>
                  <p className="secondary byline">
                    <span className="post-date">Published on <time className="dt-published">{formattedDate}</time></span>
                  </p>
                </>) :
                (<>
                  <h1 className="p-name post-title">{title}</h1>
                  <p className="secondary byline">
                    <span className="post-date">Published on <time className="dt-published">{formattedDate}</time></span>
                    <span className="reading-time">
                      Reading time: {`${post.timeToRead} minute${ post.timeToRead > 1 ? 's':'' }`}
                    </span>
                  </p>
                </>)
              }
              <div className="e-content">{ renderAst(post.htmlAst) }</div>
              {
                !isLink &&
                (<div className="article-footer secondary">
                  <p>
                    If you liked this article, you should <a href="https://twitter.com/lekevicius">follow me on Twitter</a> or <a href="https://tinyletter.com/lekevicius/">subscribe to my low-volume newsletter</a>.
                    Or just share it with your friends, that would be very nice.
                  </p>
                  <ul className="unstyled share-links">
                    <li><a
                      href={`https://twitter.com/intent/tweet?text=${
                        encodeURI(this.props.data.markdownRemark.frontmatter.title)
                        }&amp;url=${this.props.location.href}&amp;via=lekevicius`}
                      onClick={(e) => {
                        e.preventDefault();
                        window.open(e.currentTarget.attributes.href.value, 'twitter-share', 'width=550,height=320');
                        return false;
                      }}
                    ><SocialTwitter /><span>Tweet</span></a></li>
                    <li><a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${this.props.location.href}`}
                      onClick={(e) => {
                        e.preventDefault();
                        window.open(e.currentTarget.attributes.href.value, 'facebook-share','width=580,height=320');
                        return false;
                      }}
                    ><SocialFacebook /><span>Share</span></a></li>
                  </ul>
                </div>)
              }
            </article>
          </div>
          <JournalSidebar minimal={isLink} />
        </div>
        {/* <hr />
        <ul class="page-navigation">
          <li>
            {
              previous &&
              <Link to={previous.fields.journalPath} rel="prev">
                ← Previous post
              </Link>
            }
          </li>
          <li>
            {
              next &&
              <Link to={next.fields.journalPath} rel="next">
                Next post →
              </Link>
            }
          </li>
        </ul> */}
      </Layout>
    )
  }
}

export default JournalPostTemplate

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      fields {
        slug
      }
      htmlAst
      timeToRead
      excerpt
      frontmatter {
        title
        date
        link
        bodyclass
      }
    }
    featureImage: file(fields: {
      featureImageType: { eq: "journal" }
      featureImageSlug: { eq: $slug }
    }) {
      fields {
        featureImageType
        featureImageSlug
      }
      publicURL
    }
  }
`
