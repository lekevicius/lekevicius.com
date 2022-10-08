import { Link } from 'gatsby'
import graphic from './images/graphic.png'
import More from '../../assets/images/more.inline.svg'

const LoopBlock = ({ classes }) => {
  return (
    <div className={`${classes} bg-gradient-to-b from-[#DCE1F5]/70 to-[#F5F6FA]/70 dark:from-[#000000]/60 dark:to-[#000000]/20 flex flex-col items-start`} >
      <div className="grow w-full h-72 bg-no-repeat" style={{
        backgroundImage: `url(${graphic})`,
        backgroundSize: '512px 376px',
        backgroundPosition: 'center top -5.25rem'
      }} />
      <div className="p-6 flex flex-col items-start">
        <p>My most successful project to date has been a game <strong>Infinite Loop</strong>, played by over 50 million players.</p>

        <Link to="/loop/" className="inline-flex space-x-1 font-semibold p-2 -m-2 mt-4 hover:bg-indigo-400/10 transition-all rounded-lg">
          <More /> <span>Read More</span>
        </Link>
      </div>
    </div>
  )
}

export default LoopBlock

// tag: Got Acquired