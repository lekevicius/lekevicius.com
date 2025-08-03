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

import { useState } from "react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownDescription,
  DropdownHeading,
  DropdownClose,
  useDropdownContext
} from "./Dropdown";

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
  const { open } = useDropdownContext();
  return (<DropdownTrigger asChild><a
    href="#"
    onClick={(event) => {
      event.preventDefault();
    }}
    className={`block px-4 text-base lg:text-xl py-1.5 font-semibold rounded-lg ${open ? 'bg-[#999999] dark:bg-[#333333]' : ''} transition-all`}>Contact</a></DropdownTrigger>)
}

export default ({ contact }: { contact: Record<string, ContactLink[]> }) => {
  return (
    <Dropdown>
      <ContactLinkTrigger />
      <DropdownContent>
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
        <h3 className='py-2 px-4 uppercase text-sm tracking-wider text-slate-700/60  dark:text-slate-300/60'>Follow</h3>
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
        <h3 className='py-2 px-4 uppercase text-sm tracking-wider text-slate-700/60  dark:text-slate-300/60'>Lithuanian</h3>
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
        {/* <DropdownClose>Close</DropdownClose> */}
      </DropdownContent>
    </Dropdown>
  )
}