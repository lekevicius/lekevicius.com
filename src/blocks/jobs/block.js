import React, { useEffect, useState } from "react";
import { Link } from 'gatsby'
import LemonLabsLogo from './images/lemon-labs.inline.svg'
import TreatwellLogo from './images/treatwell.inline.svg'
import BackgroundImg from './images/background.svg'
import BackgroundImgDark from './images/background-dark.svg'
import More from '../../assets/images/more.inline.svg'

const JobsBlock = ({ classes }) => {
  let [background, setBackground] = useState(BackgroundImg)

  useEffect(() => {
    if (typeof window !== `undefined`) {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setBackground(BackgroundImgDark)
      }
    }
  }, [])

  return (
    <div className={`${classes} p-6 group bg-cover bg-center text-stone-800 dark:text-white/90 flex flex-col items-start`} style={{ backgroundImage: `url(${background})` }}>
      <div className="flex space-x-4 items-center mb-6">
        <LemonLabsLogo />
        <TreatwellLogo />
      </div>
      
      <div className="grow">
        <p><strong>I used to be a digital product designer.</strong></p>
        <p className="mt-4">I have co-founded <a href="http://lemonlabs.co/">Lemon Labs</a>, an app design and development agency where we developed dozens of apps.</p>
        <p className="mt-4">It was later acquired by <a href="https://www.treatwell.co.uk/">Treatwell</a>, where I worked as head of product design.</p>
      </div>
      
      <Link to="/resume/" className="inline-flex space-x-1 font-semibold p-2 -m-2 mt-4 hover:bg-rose-700/20 dark:hover:bg-blue-700/20 transition-all rounded-lg">
        <More /> <span>View Resume</span>
      </Link>
    </div>
  )
}

export default JobsBlock
