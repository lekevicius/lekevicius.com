import React from "react"
import { Link } from 'gatsby'
import Logo from '../assets/images/logo.inline.svg'

const blend = "mix-blend-color-burn dark:mix-blend-color-dodge text-[#323232] dark:text-[#9A9A9A]"
// 1F1F1F
const HeaderName = ({ isHome = false, data }) => {
  const HeaderTag = `h${isHome ? '1' : '3'}`
  return (
    <>
      <Logo className={`h-8 w-8 lg:h-10 lg:w-10 ${blend}`} />
      <div className='flex flex-col items-start lg:flex-row lg:items-center'>
        <HeaderTag className={`text-2xl lg:text-4xl font-bold tracking-tight ${blend}`}>{data.title}</HeaderTag>
        {
          data.shoutout && data.shoutout !== '' &&
          <div className="mt-2 lg:mt-1 lg:ml-4 px-3 py-1 bg-white/50 dark:bg-black/30 font-semibold rounded-md shadow">{data.shoutout}</div>
        }
      </div>
    </>
  )
}

export default function Header({ isHome = false, data }) {
  return (
    <header className={`p-6 pb-8 ${isHome ? 'lg:pb-16 pt-12 lg:pt-32' : 'lg:p-16 lg:pb-12 pt-8 lg:pt-12'
      }`}>
      {
        isHome ?
          <div className="flex space-x-2 lg:space-x-4 lg:items-center"><HeaderName isHome={isHome} data={data} /></div> :
          <Link to="/" className="flex space-x-2 lg:space-x-4 lg:items-center"><HeaderName isHome={isHome} data={data} /></Link>
      }
      {
        isHome &&
        <p className={`text-xl lg:text-2xl mt-8 lg:mt-16 lg:max-w-none ${blend}`}>I am inventing on the internet. Previously a product designer,<br className='hidden lg:inline' /> now independent maker building my own ideas.</p>
      }
    </header>
  )
}
