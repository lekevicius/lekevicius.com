import React from 'react'
import Img from "gatsby-image"
import { get } from 'lodash'
import { take, drop } from 'lodash'
import { graphql } from 'gatsby'
// import { Link } from 'gatsby'

import excerptImage from './nyt/excerpt.png'
import emptyImage from './nyt/empty.png'

import "./nyt/nyt.css"
import Layout from '../../templates/Layout'

const weekCommentary = [
  "The first big story of the year was the airstrike killing Gen. Suleimani, and the resulting [Conflict with Iran].",
  "[Conflict with Iran] dominated the headlines, with a lot of worrying about possible escalation to war. Iran downed a passenger jet.",
  "As it de-escalated, [Conflict with Iran] disappeared from headlines. The biggest news of the week was Senate taking up Trump’s [Impeachment] case. New debates in [Democratic Primaries] race.",
  "With most news covering [Impeachment] trial, the very first frontpage news about [Coronavirus] appeared: “Fear of Pandemic Rises” mentioned “at least 3 people dead”. First case in US, and lockdown of Wuhan.",
  "Trump’s [Impeachment] news about witness blocking tussled for attention with [Coronavirus]. US restricted travel from China.",
  "Iowa caucuses in [Democratic Primaries] and Trump’s acquittal in [Impeachment] trial dominated this week. [Coronavirus] news still appeared on every frontpage.",
  "From this week on, no new bigger stories emerged. Sanders won New Hampshire in [Democratic Primaries], and the world focused on China battling the outbreak.",
  "Debates, and Sanders won Nevada in [Democratic Primaries]. Most of [Coronavirus] coverage is about Diamond Princess. Concerns over the threat of pandemic raised.",
  "More debates in [Democratic Primaries]. [Coronavirus] coverage increased: Italy in lockdown, Pence tasked with leading virus response, and big stock dive.",
  "Biden won Super Tuesday in [Democratic Primaries], Warren and Bloomberg left the race. Slight increase in [Coronavirus] coverage.",
  "This was the week when [Coronavirus] decisively took over the news. Italy's lockdown, stocks tumbling down even further, WHO naming the outbreak a pandemic.",
  "[Coronavirus] coverage turns to US. Shelter in place orders, FED cutting interest rate to 0, and early discussions of a stimulus package.",
  "The only week when every single article on the frontpage, all week long, was only about the [Coronavirus]. Senate approved $2B package, massive jobless claims, US became a country with most cases.",
  "Another single-topic week, with almost all stories focusing on [Coronavirus]. Even more job losses, grim death estimates, New York overwhelmed with cases.",
  "[Coronavirus] maintained complete hold over the frontpage. What would be major news during normal years, Sanders dropping out of [Democratic Primaries] and making Biden a presumptive nominee, only got a sliver of the page.",
  "With [Coronavirus] cases still increasing rapidly, coverage turned to reopening, and who has the power to do so.",
  "More [Coronavirus]-covered frontpages. Topics included unaccounted deaths, comparison between states and Trump pushing suspect cures.",
  "[Coronavirus] coverage continues. Reopening and shrinking of economy was the most common thread.",
  "[Coronavirus] has impacted every aspect of life so much that it is unavoidable in almost every story. Only Justice Dept. dropping Flynn’s case breaked through.",
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
    for (let index = 0; index < (5 + 7 * 18); index++) {
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
      <Layout location={this.props.location} title="Pandemic Rises" bodyClass="light">
        <div className="page-header">
            <div className="page-header-text">
            <h1>“Fear of Pandemic Rises”</h1>
            <p className="page-lead">So called was the very first article about the Coronavirus that appeared on New York Times frontpage on January 21st. This page takes a look at every frontpage published in 2020, tracking bigger stories, and illustrating how our news coverage became about one thing only.</p>
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
          🖥 For the clearest look at the analysis, view this page on a desktop.
        </p>
        <p className="notes">
          <strong>Notes on methodology:</strong> annotated are clearly single-theme stories that consistently appear on  NYT frontpage for more than a week. Small stories at the bottom of the frontpage are not annotated. Coronavirus-related stories are not split into sub-topics (health, economics, politics) because New York Times themselves don’t split them (they usually split story groups with double lines, not so with Coronavirus-related stories) and articles themselves often touch on multiple sub-topics.
        </p>
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
            <div className="cover empty"><img alt="" src={emptyImage} /></div>
            <div className="cover empty"><img alt="" src={emptyImage} /></div>
            <div className="cover empty"><img alt="" src={emptyImage} /></div>
            <div className="cover empty"><img alt="" src={emptyImage} /></div>
            <div className="cover empty"><img alt="" src={emptyImage} /></div>
            <div className="cover empty"><img alt="" src={emptyImage} /></div>
            <div className="cover empty"><img alt="" src={emptyImage} /></div>

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
