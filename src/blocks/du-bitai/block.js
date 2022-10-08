import Logo from './images/logo.inline.svg'
import graphic from './images/graphic.svg'
import graphicDark from './images/graphic-dark.svg'

import ApplePodcastIcon from './images/apple.inline.svg'
import GooglePodcastIcon from './images/google.inline.svg'
import OvercastPodcastIcon from './images/overcast.inline.svg'
import PocketcastsPodcastIcon from './images/pocketcasts.inline.svg'
import RssPodcastIcon from './images/rss.inline.svg'
import SpotifyPodcastIcon from './images/spotify.inline.svg'

const DuBitaiBlock = ({ classes }) => {
  return (
    <div className={`${classes} bg-[#153543] overflow-hidden`}>
      <div className="h-60 bg-center dark:hidden" style={{ backgroundImage: `url(${graphic})` }} />
      <div className="h-60 bg-center hidden dark:block" style={{ backgroundImage: `url(${graphicDark})` }} />
      <div className="p-6 flex flex-col items-start text-white">
        <Logo />
        <p className="mt-4">
          <strong>I host a weekly radio show about tech news.</strong><br className='hidden lg:inline' /> It’s in Lithuanian and called <a href="https://dubitai.com/">Du Bitai</a>.
        </p>
        <p>You can also subscribe to it as a podcast:</p>

        <ul className="flex space-x-4 text-[#7EE2F9] mt-4">
          <li>
            <a title="Spotify" href="https://open.spotify.com/show/0XFnRB1ikmEk1Orf7yhv0J" 
              className="block p-2 -m-2 hover:bg-[#7EE2F9]/10 transition-all rounded-lg">
              <SpotifyPodcastIcon />
            </a>
          </li>
          <li>
            <a title="Apple Podcasts" href="https://podcasts.apple.com/podcast/id1583956271" 
              className="block p-2 -m-2 hover:bg-[#7EE2F9]/10 transition-all rounded-lg">
              <ApplePodcastIcon />
            </a>
          </li>
          <li>
            <a title="Overcast" href="https://overcast.fm/itunes1583956271/du-bitai" 
              className="block p-2 -m-2 hover:bg-[#7EE2F9]/10 transition-all rounded-lg">
              <OvercastPodcastIcon />
            </a>
          </li>
          <li>
            <a title="Google Podcasts" href="https://podcasts.google.com/feed/aHR0cHM6Ly9kdWJpdGFpLmNvbS9mZWVkLw" 
              className="block p-2 -m-2 hover:bg-[#7EE2F9]/10 transition-all rounded-lg">
              <GooglePodcastIcon />
            </a>
          </li>
          <li>
            <a title="PocketCasts" href="https://pca.st/qf6jrni0" 
              className="block p-2 -m-2 hover:bg-[#7EE2F9]/10 transition-all rounded-lg">
              <PocketcastsPodcastIcon />
            </a>
          </li>
          <li>
            <a title="RSS" href="https://dubitai.com/feed/" 
              className="block p-2 -m-2 hover:bg-[#7EE2F9]/10 transition-all rounded-lg">
              <RssPodcastIcon />
            </a>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default DuBitaiBlock
