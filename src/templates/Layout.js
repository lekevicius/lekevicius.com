import Background from '../components/Background'

import './styles/reset.css'
import './styles/global.css'

const Layout = ({ children }) => {
  return (<>
    <Background />
    <>{children}</>
  </>)
}

export default Layout
