// import buttondownImage from '../assets/services/buttondown.svg?raw'
// import discordImage from '../assets/services/discord.svg?raw'
// import dribbbleImage from '../assets/services/dribbble.svg?raw'
// import ensImage from '../assets/services/ens.svg?raw'
import emailImage from '../assets/services/email.svg?raw'
// import exposureImage from '../assets/services/exposure.svg?raw'
import facebookImage from '../assets/services/facebook.svg?raw'
// import galleryImage from '../assets/services/gallery.svg?raw'
import githubImage from '../assets/services/github.svg?raw'
// import glassImage from '../assets/services/glass.svg?raw'
// import hackerNewsImage from '../assets/services/hacker-news.svg?raw'
import instagramImage from '../assets/services/instagram.svg?raw'
// import lensImage from '../assets/services/lens.svg?raw'
// import letterboxdImage from '../assets/services/letterboxd.svg?raw'
import linkedinImage from '../assets/services/linkedin.svg?raw'
// import mediumImage from '../assets/services/medium.svg?raw'
import messengerImage from '../assets/services/messenger.svg?raw'
import telegramImage from '../assets/services/telegram.svg?raw'
import threadsImage from '../assets/services/threads.svg?raw'
import xImage from '../assets/services/x.svg?raw'
import menuIcon from '../assets/images/menu.svg?raw'
import { blend } from './Header.astro'

import { useState } from "react";
import {
  FullscreenMenu,
  FullscreenMenuTrigger,
  FullscreenMenuContent,
  FullscreenMenuDescription,
  FullscreenMenuHeading,
  FullscreenMenuClose,
  useFullscreenMenuContext
} from "./FullscreenMenu";

type Client = {
  name: string;
  link: string;
  logo: string;
  contribution: string;
}

const logos: Record<string, string> = {
  'email': emailImage,
  'facebook': facebookImage,
  'github': githubImage,
  'instagram': instagramImage,
  'linkedin': linkedinImage,
  'messenger': messengerImage,
  'telegram': telegramImage,
  'threads': threadsImage,
  'x': xImage,
}

type ContactLink = {
  title: string;
  link: string;
  icon: string;
}

const ContactLinkTrigger = () => {
  const { open } = useFullscreenMenuContext();
  return (<FullscreenMenuTrigger asChild><div className={`-mr-2 p-1 w-8 h-8 ${blend} cursor-pointer`} dangerouslySetInnerHTML={{ __html: menuIcon }} /></FullscreenMenuTrigger>)
}

export default ({ contact }: { contact: Record<string, ContactLink[]> }) => {
  return (
    <FullscreenMenu>
      <ContactLinkTrigger />
      <FullscreenMenuContent>
        <div className={`max-w-[480px] mx-auto px-4 lg:px-10`}>
          <ul className='flex flex-col'>
            {
              contact._.map((link) => (
                <li key={link.icon}>
                  <a
                    href={link.link}
                    className="flex items-center gap-x-4 rounded-xl transition-all py-2 px-4 hover:bg-slate-300/30 dark:hover:bg-slate-500/20"
                  >
                    <figure dangerouslySetInnerHTML={{ __html: logos[link.icon] }} />
                    <h6 className="font-medium">{link.title}</h6>
                  </a>
                </li>
              ))
            }
            <li>
              <a
                href="mailto:JL"
                id="email-link"
                className="flex items-center gap-x-4 rounded-xl transition-all py-2 px-4 hover:bg-slate-300/30 dark:hover:bg-slate-500/20"
              // onClick={(event) => {
              //   event.currentTarget.href = 'mailto:' + window.atob('am9uYXNAbGVrZXZpY2l1cy5jb20=')
              // }}
              >
                <figure dangerouslySetInnerHTML={{ __html: logos['email'] }} />
                <div>
                  <h6 className="font-medium">Email</h6>
                </div>
              </a>
            </li>
          </ul>
          <h3 className='py-2 px-4 uppercase text-sm tracking-wider text-slate-300/60'>Follow</h3>
          <ul className='flex flex-col'>
            {
              contact.follow.map((link) => (
                <li key={link.icon}>
                  <a
                    href={link.link}
                    className="flex items-center gap-x-4 rounded-xl transition-all py-2 px-4 hover:bg-slate-300/30 dark:hover:bg-slate-500/20"
                  >
                    <figure dangerouslySetInnerHTML={{ __html: logos[link.icon] }} />
                    <h6 className="font-medium">{link.title}</h6>
                  </a>
                </li>
              ))
            }
          </ul>
          <h3 className='py-2 px-4 uppercase text-sm tracking-wider text-slate-300/60'>Lithuanian</h3>
          <ul className='flex flex-col'>
            {
              contact.lithuanian.map((link) => (
                <li key={link.icon}>
                  <a
                    href={link.link}
                    className="flex items-center gap-x-4 rounded-xl transition-all py-2 px-4 hover:bg-slate-300/30 dark:hover:bg-slate-500/20"
                  >
                    <figure dangerouslySetInnerHTML={{ __html: logos[link.icon] }} />
                    <h6 className="font-medium">{link.title}</h6>
                  </a>
                </li>
              ))
            }
          </ul>
          {/* <FullscreenMenuClose>Close</FullscreenMenuClose> */}
        </div>
      </FullscreenMenuContent>
    </FullscreenMenu>
  )
}