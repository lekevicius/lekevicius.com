import { Link } from 'gatsby'
import SelfImage from './images/self.png'
import More from '../../assets/images/more.inline.svg'

const ProfileBlock = ({ classes }) => {
  const age = Math.abs(new Date(Date.now() - Date.parse("1990-09-14")).getUTCFullYear() - 1970);

  return (
    <div className={`${classes} grow bg-gradient-to-b from-[#2A957B] to-[#22215D] dark:from-[#2A957B]/60 dark:to-[#22215D]/60 text-white p-6 flex`}>
      <div className="flex flex-col items-start shrink-0 w-36 lg:w-48">
        <p className="grow">
          Hi, this is me. {age} years old, living and creating in Vilnius, Lithuania. I’ve been both a designer and a developer — and still enjoy both.
        </p>
        <Link to="/profile/" className="inline-flex space-x-1 font-semibold p-2 -m-2 mt-4 hover:bg-sky-600/40 transition-all rounded-lg">
          <More /> <span>Read Profile</span>
        </Link>
      </div>
      <div className="grow -mr-12 lg:mr-0 bg-contain bg-center bg-no-repeat mix-blend-screen" style={{ backgroundImage: `url(${SelfImage})` }}>
      </div>
    </div>
  )
}

export default ProfileBlock
