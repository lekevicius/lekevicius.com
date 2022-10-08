import Navigate from '../../assets/images/navigate.inline.svg'
import { Link } from 'gatsby'

const NFTGalleryBlock = ({ classes }) => {
  return (
    <div className={`${classes} bg-white/75 p-6 flex flex-col items-start`}>
      <p>
        I like to both create and collect NFT art. <br />My collection is viewable on Gallery.
      </p>
      <a href="https://gallery.so/jonas" className="inline-flex space-x-1 font-semibold p-2 -m-2 mt-4 hover:bg-black/10 transition-all rounded-lg">
        <Navigate /> <span>NFT Gallery</span>
      </a>
    </div>
  )
}

export default NFTGalleryBlock
