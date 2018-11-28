import React from 'react'
import { Link } from 'gatsby'
import Logo from './graphics/Logo'
import './Header.css'

class Header extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOpen: false };
    this.toggleOpenClass = this.toggleOpenClass.bind(this);
    this.collapseMenu = this.collapseMenu.bind(this);
  }

  toggleOpenClass(e) {
    e.preventDefault()
    this.setState(state => ({ isOpen: !state.isOpen }))
  }

  collapseMenu() {
    this.setState(() => ({ isOpen: false }))
  }

  render() {
    const rootPath = `${__PATH_PREFIX__}/`
    let heading
    let headerClass = 'page'

    let headerBackground = this.props.headerBackground ?
      this.props.headerBackground :
      null;

    let headerText = this.props.headerText ?
      this.props.headerText :
      null;

    if (this.props.location.pathname === rootPath) {
      heading = (
        <h1>
          <Link onClick={this.collapseMenu} to={'/'}>
            <Logo />
            <span>{this.props.siteTitle}</span>
          </Link>
        </h1>
      )
      headerClass = 'homepage'
    } else {
      heading = (
        <h3>
          <Link onClick={this.collapseMenu} to={'/'}>
            <Logo />
            <span>{this.props.siteTitle}</span>
          </Link>
        </h3>
      )
    }

    return (
      <header style={{
        '--header-background': headerBackground,
        '--header-color': headerText,
      }} className={`${headerClass}${this.state.isOpen ? ' open' : ''}`}>
        <div className="container">
          {heading}
          <p className="tagline">designs and builds digital things.</p>
          <nav>
            <ul>
              <li><Link onClick={this.collapseMenu} to={'/projects/'}>Projects</Link></li>
              <li><Link onClick={this.collapseMenu} to={'/journal/'}>Journal</Link></li>
              <li><Link onClick={this.collapseMenu} to={'/profile/'}>Profile</Link></li>
              <li><Link onClick={this.collapseMenu} to={'/now/'}>Now</Link></li>
            </ul>
          </nav>
        </div>
        <a href="#" onClick={this.toggleOpenClass} className="menu-toggle">
          <div className="line top-line"></div>
          <div className="line bottom-line"></div>
        </a>
      </header>
    )
  }
}

export default Header
