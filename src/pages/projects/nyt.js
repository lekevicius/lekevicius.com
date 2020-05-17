import React from 'react'
import Img from "gatsby-image"
import { get } from 'lodash'
import { take, drop } from 'lodash'
import { graphql } from 'gatsby'
// import { Link } from 'gatsby'

import excerptImage from './nyt/excerpt.png'
import shareImage from './nyt/feature-image.png'
import overviewImage from './nyt/overview.jpg'

import SocialTwitter from '../../components/graphics/SocialTwitter'
import SocialFacebook from '../../components/graphics/SocialFacebook'

import "./nyt/nyt.css"
import Layout from '../../templates/Layout'

const weekCommentary = [
  "The first big story of the year was the airstrike killing Gen. Suleimani, and the resulting [Conflict with Iran].",
  "[Conflict with Iran] dominated the headlines, with a lot of worry about a possible escalation to war. Iran downed a passenger jet.",
  "As it de-escalated, [Conflict with Iran] disappeared from the headlines. The biggest news of the week was the Senate taking up Trump’s [Impeachment] case. New debates in the [Democratic Primaries] race.",
  "With most news covering [Impeachment] trial, the very first mention of [Coronavirus] appeared on the front page: “Fear of Pandemic Rises” mentioned “at least 3 people dead”. First case in the US, and lockdown in Wuhan.",
  "Trump’s [Impeachment] news about witness blocking competed for attention against [Coronavirus]. US restricted travel from China.",
  "Iowa caucuses in [Democratic Primaries] and Trump’s acquittal in [Impeachment] trial dominated this week. [Coronavirus] news consistently appeared on every front page.",
  "From this week on, no new larger stories emerged. Sanders won New Hampshire in [Democratic Primaries], and the world focused on China battling the outbreak.",
  "Debates, and Sanders won Nevada in [Democratic Primaries]. Most of [Coronavirus] coverage was focused on Diamond Princess. Concerns over the threat of pandemic were raised.",
  "More debates in [Democratic Primaries]. [Coronavirus] coverage increased: Italy in lockdown, Pence tasked with leading the virus response force, and a big stock dive.",
  "Biden won Super Tuesday in [Democratic Primaries], Warren and Bloomberg left the race. Slight increase again in [Coronavirus] coverage.",
  "This was the week when [Coronavirus] decisively took over the news. Italy’s lockdown, stocks tumbling down even further, WHO declared the outbreak a pandemic.",
  "[Coronavirus] coverage turns to the US. Shelter-in-place orders, FED cutting interest rate to zero, and early discussions of a stimulus package.",
  "An exceptional week with every single article on the front page covering [Coronavirus]. Senate approved a $2T stimulus package, massive jobless claims, US became the country with the most cases.",
  "Another single-topic week, with almost all stories focusing on [Coronavirus]. Even more job losses, grim death estimates, New York overwhelmed with cases.",
  "[Coronavirus] maintained complete hold over the front page. What would be headline news during normal times, Sanders dropping out of the [Democratic Primaries] and making Biden a presumptive nominee, only got a sliver of the page.",
  "With [Coronavirus] cases still increasing rapidly, coverage turned to reopening, and who would be in power to command it.",
  "More [Coronavirus]-covered front pages. Topics included unattributed deaths, comparison between states and Trump pushing suspect cures.",
  "[Coronavirus] coverage continues. Reopening and expected shrinking of the economy were the most common threads.",
  "[Coronavirus] has impacted every aspect of our lives so much that it is unavoidable in nearly every story. The only article that broke the trend was about the Justice Department dropping Flynn’s case.",
  "While no story can compete with the hold [Coronavirus] has over the front pages, Flynn’s case appears on three of them.",
]

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

class NYTPage extends React.Component {
  spanify(string) {
    let s = string
    const keywords = {
      "ir": "Conflict with Iran",
      "im": "Impeachment",
      "dp": "Democratic Primaries",
      "cv": "Coronavirus"
    }
    for (const key of Object.keys(keywords)) {
      s = s.replace(`[${keywords[key]}]`, `<span class="${key}">${keywords[key]}</span>`)
    }
    return s
  }
  render() {
    const coversByDateKey = {}
    const images = get(this, 'props.data.allFile.edges')
    images.map(({ node }) => {
      const imageMatch = node.absolutePath.match(/\/projects\/nyt\/covers\/([a-z0-9-]+).png/)
      if (imageMatch) {
        coversByDateKey[imageMatch[1]] = node.childImageSharp.fluid
      }
      return null
    })

    let days = [{ code: "" }, { code: "" }]
    let jan1 = Date.parse('01 Jan 2020 04:00:00 GMT')
    let d = new Date(jan1)
    for (let index = 0; index < (5 + 7 * 19); index++) {
      let month = (d.getMonth()+1).toString().padStart(2, '0')
      let date = d.getDate().toString().padStart(2, '0')
      let dayCode = `${month}-${date}`
      let copiedDate = new Date(d.getTime())
      days.push({
        code: dayCode,
        date: copiedDate
      })
      d.setDate(d.getDate() + 1)
    }
    let weeks = []
    while (days.length > 0) {
      let week = take(days, 7)
      days = drop(days, 7)
      let firstDay = null
      for (const day of week) {
        if (day.code !== "") {
          firstDay = day.date
          break
        }
      }
      let lastDay = week[6].date
      weeks.push({
        days: week,
        firstDay,
        lastDay
      })
    }

    return (
      <Layout location={this.props.location} title="Pandemic Rises" bodyClass="light" shareImage={shareImage}>
        <div className="page-header">
            <div className="page-header-text">
            <h1>“Fear of Pandemic Rises”</h1>
            <p className="page-lead">…was the very first article about the Coronavirus that appeared on the New York Times’ front page on January 21st. This analysis takes a look at every front page from 2020, tracking stories and illustrating how our news coverage became about one thing only.</p>
          </div>
          <div className="page-header-append">
            <img alt="Fear of Pandemic Rises" src={excerptImage} />
          </div>
        </div>
        
        <h4>Colors used</h4>
        <ul className="page-legend">
          <li className="dp">
            <div className="dot-icon"></div>
            Democratic Primaries
          </li>
          <li className="ir">
            <div className="dot-icon"></div>
            Conflict with Iran
          </li>
          <li className="im">
            <div className="dot-icon"></div>
            Trump’s Impeachment
          </li>
          <li className="cv">
            <div className="dot-icon"></div>
            Coronavirus
          </li>
        </ul>
        <p className="desktop-notice">
          🖥 For the best viewing experience, open this page on a desktop.
        </p>
        <p className="notes">
          <strong>Notes on the methodology:</strong> each 2020 New York Times front page has been annotated by single-theme stories that have consistently appeared for more than a week. Minor stories at the bottom of the front page have not been annotated. Coronavirus-related stories are not further split into subtopics (e.g. health, economics, or politics) because New York Times themselves don’t. The usual double-line marking hasn’t been used for Coronavirus, because articles often touch on multiple subtopics.
        </p>
        <h2>Overview</h2>
        <div className="overview-layout overview">
          <div className="overview-content">
            <a href={overviewImage}>
              <img src={overviewImage} alt="Overview of all weeks" />
            </a>
          </div>
          <div className="overview-commentary">
            <p>Before delving into more detail about each week, it’s worthwhile to take a bird eye’s view at the year so far, and how the news coverage transition happened on macro scale.</p>
            <p>The beginning of the year showed the usual cycle: there is usually one long-term story (<span className="ir">Conflict with Iran</span> for the first two weeks, <span className="im">Trump’s Impeachment</span> for the following three), but this story almost never fully covers the front page. As the story resolves, something else fills the void — in this case more focus on the <span className="dp">Democratic Primaries</span> race.</p>
            <p><span className="cv">Coronavirus</span> does not fit this usual cycle. Starting with early March, almost every front page is exclusively covering the pandemic. These are not usual times — and this project explores these unusual New York Times front pages.</p>
            <p>Below, you can read a Week by Week analysis, highlighting what topics where the most prominent each week.</p>
            
            <div className="article-footer secondary">
              <p>Feel free to share this project or the overview image on social media. To save the image, right-click and select “Save Image As…”</p>
              <p>
                If you liked this project, you should <a href="https://twitter.com/lekevicius">follow me on Twitter</a> or <a href="https://tinyletter.com/lekevicius/">subscribe to my low-volume newsletter</a>.
              </p>
              <ul className="unstyled share-links">
                <li><a
                  href={`https://twitter.com/intent/tweet?text=${
                    encodeURI("Fear of Pandemic Rises")
                    }&amp;url=https://lekevicius.com/projects/nyt&amp;via=lekevicius`}
                  onClick={(e) => {
                    e.preventDefault();
                    window.open(e.currentTarget.attributes.href.value, 'twitter-share', 'width=550,height=320');
                    return false;
                  }}
                ><SocialTwitter /><span>Tweet</span></a></li>
                <li><a
                  href={`https://www.facebook.com/sharer/sharer.php?u=https://lekevicius.com/projects/nyt`}
                  onClick={(e) => {
                    e.preventDefault();
                    window.open(e.currentTarget.attributes.href.value, 'facebook-share','width=580,height=320');
                    return false;
                  }}
                ><SocialFacebook /><span>Share</span></a></li>
              </ul>
            </div>
          </div>
        </div>
        <h2>Week by Week</h2>
        <div className="week-grid">
          { weeks.map((week, index) => 
            <div className={`week-row week-${index + 1}`} key={`week-${index + 1}`}>
              { week.days.map((day, index) =>
                <div className={`cover${ day.code === '' ? ' empty' : '' }`} key={day.code + index}>
                  { day.code === '' && <div className="empty-day"></div> }
                  { day.code !== '' && 
                    <a href={`https://static01.nyt.com/images/2020/${day.code.slice(0,2)}/${day.code.slice(3)}/nytfrontpage/scan.pdf`}>
                      <Img fluid={coversByDateKey[day.code]} />
                    </a>
                  }
                </div>
              )}
              <div className="commentary">
                <h4>
                  <strong>Week {index + 1}</strong> { monthNames[week.firstDay.getMonth()] } { week.firstDay.getDate() } - { monthNames[week.lastDay.getMonth()] } { week.lastDay.getDate() }
                </h4>
                <p dangerouslySetInnerHTML={{__html: this.spanify(weekCommentary[index])}} />
              </div>
            </div>
          )}
          <div className="week week-row week-future">
            <div className="cover empty"></div>
            <div className="cover empty"></div>
            <div className="cover empty"></div>
            <div className="cover empty"></div>
            <div className="cover empty"></div>
            <div className="cover empty"></div>
            <div className="cover empty"></div>

            <div className="commentary">
              {/* <h4><strong>There is more to this</strong></h4> */}
              <p>I will keep this page updated throughout 2020. To get notified about project updates, <a href="https://twitter.com/lekevicius">follow me on Twitter here</a>.</p>
            </div>
          </div>
        </div>
      </Layout>
    )
  }
}

export default NYTPage

export const pageQuery = graphql`
  query {
    allFile(filter: {
      absolutePath: {
        glob: "**/projects/nyt/covers/*.png"
      }
    }) {
      edges {
        node {
          absolutePath
          childImageSharp {
            fluid(maxWidth: 240) {
              base64
              aspectRatio
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
