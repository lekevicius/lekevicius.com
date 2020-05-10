import React from 'react'
// import { Link } from 'gatsby'

import Layout from '../templates/Layout'
import './profile.css'

const ProfilePage = ({ location }) => (
  <Layout location={location} title="Profile">
    <div className="page-header">
      <h1>Profile</h1>
      <p className="page-lead">I am an independent app maker, designing and building delightful and useful experiences.</p>
    </div>
    <div className="content-layout">
      <div className="content">
        {/* <Link to="/now/"></Link> */}
        <p>Now 28 years old, living in Vilnius, Lithuania. I have been designing and developing for close to 15 years, and hold a BA degree in Graphic Design from Vilnius Academy of Arts.</p>
        <p>Currently I am independently designing and building new apps, trying to create something both useful and delightful.</p>
        <p>Previously I was Head of Product Design at health and beauty marketplace <a href="https://www.treatwell.com/">Treatwell</a> and co-founded an app design and development agency <a href="http://lemonlabs.co/">Lemon Labs</a> (later acquired by Treatwell). I have also been lecturing in <a href="http://www.dizainokolegija.lt/en/">Vilnius College of Design</a> and co-founded an analytics startup <a href="https://socilyzer.com/">Socilyzer</a>.</p>

        <hr />

        <p>As far back as I can remember, I always wanted to both design and code.</p>
        <p>As a designer, I have created over a hundred websites, a bunch of games, about 20 apps and 2 magazines. I've also dabbled in 3D, animation, procedural design, edited a couple of movies and even acted in a few. When designing, I focus on information architecture, typography, usability, simple user interface and interaction design.</p>
        <p>As a developer, I have been coding my own ideas all the time. It started with Flash games. I later switched to building websites, beginning at the time when tables were the new hotness, and journeying through CSS, XHTML, jQuery and now, React. At one time I worked as a Flash game builder, another time a Ruby on Rails developer.</p>
        <p>All the time, I love to play with new technologies. Building apps since that became possible, programming drones in 2013, now, experimenting with AR and deep learning. I love this and hope this crazy ride of new tech will never stop.</p>
      </div>
      <aside>
        <h4>Social</h4>

        <ul className="unstyled social-links">
          <li>
            <a href="https://twitter.com/lekevicius">
              <h5>Twitter</h5>
              <p>Brief thoughts</p>
            </a>
          </li>

          <li>
            <a href="https://github.com/lekevicius">
              <h5>GitHub</h5>
              <p>All open source</p>
            </a>
          </li>

          <li>
            <a href="https://dribbble.com/lekevicius">
              <h5>Dribbble</h5>
              <p>Occasional pretty pixels</p>
            </a>
          </li>

          <li>
            <a href="https://instagram.com/lekevicius">
              <h5>Instagram</h5>
              <p>Photography</p>
            </a>
          </li>

          <li>
            <a href="https://letterboxd.com/lekevicius">
              <h5>Letterboxd</h5>
              <p>Movie reviews</p>
            </a>
          </li>

          <li>
            <a href="https://news.ycombinator.com/user?id=flixic">
              <h5>Hacker News</h5>
              <p>Sharing my hacks</p>
            </a>
          </li>

          <li>
            <a href="https://speakerdeck.com/lekevicius">
              <h5>SpeakerDeck</h5>
              <p>My presentations</p>
            </a>
          </li>

          <li>
            <a href="https://www.facebook.com/lekevicius">
              <h5>Facebook</h5>
              <p>Still haven't deleted it</p>
            </a>
          </li>

          <li>
            <p>You can also find me on LinkedIn. Please don’t.</p>
          </li>
        </ul>

        <h4>Contact</h4>
        
        <p><em>I am not available for any freelancing or contracting.</em></p>
        <p>
          The best way to reach me is <a href="https://t.me/lekevicius">Telegram</a>.
          For any longer conversations you can <a href="mailto:JL" onClick={(e) =>
            e.currentTarget.attributes.href.value = 'mailto:' + window.atob('am9uYXNAbGVrZXZpY2l1cy5jb20=')
          }>email me</a>.
          My public key is on <a href="https://keybase.io/lekevicius">keybase</a>.
        </p>
      </aside>
    </div>
  </Layout>
)

export default ProfilePage
