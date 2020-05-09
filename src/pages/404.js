import React from 'react'
import { Link } from 'gatsby'
import Layout from '../templates/Layout'
import './404.css'

class NotFoundPage extends React.Component {
  constructor(props) {
    super(props)
    this.searchRef = React.createRef()
    this.submitSearch = this.submitSearch.bind(this)
  }
  submitSearch(e) {
    e.preventDefault()
    if (this.searchRef.current.value !== '') {
      const url = `https://duckduckgo.com/?q=site%3Alekevicius.com+${ encodeURI(this.searchRef.current.value) }`
      window.location.href = url
    }
    return false
  }
  render() {
    return (
      <Layout location={this.props.location} title="Not Found">
        <div className="page-header">
          <h1>Page Not Found</h1>
          <p className="page-lead">As awkward as it sounds, this page doesn't exist.</p>
        </div>
        <div className="content-layout">
        <div className="content">
        <p>We could debate for quite some time how a page that <em>“doesn't exist”</em> can explain that it <em>“doesn't exist”</em>, evidently by existing. Or we could move on to more practical matters.</p>
        <p>You might have followed a dead link or mistyped something. Either way, you can <Link to="/">go to the home page</Link> or search the site for what you are looking for.</p>
        
        <form onSubmit={this.submitSearch} className="site-search" action="/">
          <input type='text' ref={this.searchRef} name='q' placeholder='Search Lekevicius.com' />
          <input type='submit' value='Search' />
        </form>
        
        <p>
          Also, if you think I should know about this nonexistent page, please tweet me <a href='http://twitter.com/lekevicius'>@lekevicius</a>.
        </p>
        </div>
        </div>
      </Layout>
    )
  }
}

export default NotFoundPage
