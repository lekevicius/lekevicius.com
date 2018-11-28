import React from 'react'
import { Link } from 'gatsby'

const JournalSidebar = ({ minimal }) => (
  <aside>
    <h4>Newsletter</h4>

    <p className="prominent">Get news about my latest apps and articles.</p>

    <form className="newsletter" action="https://tinyletter.com/lekevicius" method="post" target="popupwindow" onSubmit={ function() { window.open('https://tinyletter.com/lekevicius', 'popupwindow', 'scrollbars=yes,width=800,height=600'); return true } }>
      <input type="text" name="email" placeholder="your@email.com" id="tlemail" />
      <input type="hidden" value="1" name="embed"/>
      <input type="submit" className="secondary" value="Subscribe" />
    </form>

    <p className="small-print">I won't email you often. Expect a brief letter every 2-3 months. I also really appreciate replies and feedback.</p>

    {
      !minimal &&
      (<>
        <h4>Archive</h4>
        <ul className="unstyled archive-links">
          <li><Link to="/journal/archive/">Monthly archive</Link></li>
          <li><Link to="/journal/articles/">All articles</Link></li>
        </ul>
        <h4>Subscribe</h4>
        <ul className="unstyled subscribe-links">
          <li><a href="/feed.xml">Subscribe via RSS</a></li>
          {/* <li>Everything via <a href="">RSS</a>, <a href="">JSONFeed</a></li>
          <li>Articles via <a href="">RSS</a>, <a href="">JSONFeed</a></li> */}
        </ul>
      </>)
    }
  </aside>
)

export default JournalSidebar
