import { useState } from 'react'
import { graphql, useStaticQuery } from 'gatsby'
import Tippy from '@tippyjs/react'
import contactLinks from './data.json'

import EmailIcon from './images/email.inline.svg'
import KeyIcon from './images/key.inline.svg'
import ClipboardCheckIcon from './images/clipboard-check.inline.svg'

const ContactBlock = ({ classes }) => {
  const [iconFlipped, setIconFlipped] = useState(false)

  const animateIconFlip = () => {
    setIconFlipped(true)
    setTimeout(() => { setIconFlipped(false) }, 1000)
  }

  const linkIcons = useStaticQuery(graphql`
    query { allFile(filter: {absolutePath: {glob: "**/contact/images/*.svg"}}) {
      edges { node {
        absolutePath
        childrenSvg { content { data } }
      } }
    } }
  `).allFile.edges

  const linkIconObject = {}
  for (const link of linkIcons) {
    const path = link.node.absolutePath
    const linkId = path.match(/\/([a-zA-Z0-9-]+)\.svg$/)
    if (path.indexOf('.inline.') > -1) continue;
    if (linkId && linkId[1]) {
      linkIconObject[linkId[1]] = link.node.childrenSvg[0].content.data
    } else {
      console.error(path)
    }
  }

  const copyKey = () => {
    navigator.clipboard.writeText(`
-----BEGIN PGP PUBLIC KEY BLOCK-----

mDMEYzSWPxYJKwYBBAHaRw8BAQdAOKLBV2r665Xv/gtalxPNFbFn4Zb5BvkybrNB
UD0ZcsG0FGpvbmFzQGxla2V2aWNpdXMuY29tiJkEExYKAEEWIQRw+Ucqjy0uw/Md
ImYw9guqdf/Q1wUCYzSWPwIbAwUJA8JnAAULCQgHAgIiAgYVCgkICwIEFgIDAQIe
BwIXgAAKCRAw9guqdf/Q1/t/APsHB3PVv70Y5Fvm0jZdiAkXT/Q++KdXa/kmES4A
bAEK2AEAs5Plng1hxII6t9wGylSwUjc2gWsL8t+yScyRBqZ3oAe4OARjNJY/Egor
BgEEAZdVAQUBAQdA7mDFEvWFVBuRY5Qy79R6t2o+LBsdrfHyGSgeA5/kMV8DAQgH
iHgEGBYKACAWIQRw+Ucqjy0uw/MdImYw9guqdf/Q1wUCYzSWPwIbDAAKCRAw9guq
df/Q10zXAP9+5/ABBDYdZFH3FHYqlJGYieWaMLlPmpnSQmFZIIFJtgD+OVEmKRDZ
E1bfSUgCOFL1IFBaLs1h/mg551rmNW10wAo=
=tZq9
-----END PGP PUBLIC KEY BLOCK-----
`)
    animateIconFlip()
  }

  return (
    <div className={`${classes} grow-0 bg-slate-700 dark:bg-slate-700/70 text-cyan-200 p-6`}>
      <ul className="flex flex-col gap-y-4">
        {contactLinks.map((link) => {
          return <li key={link.title}>
            <a href={link.link} className="flex gap-x-4 rounded-xl transition-all -my-2 -mx-4 py-2 px-4 hover:bg-slate-500/40">
              <figure dangerouslySetInnerHTML={{ __html: linkIconObject[link.icon] }} />
              <div>
                <h6 className="font-medium">{link.title}</h6>
                <p className="text-sm text-slate-400">{link.description}</p>
              </div>
            </a>
          </li>
        })}

        <li>
          <a href="mailto:JL" onClick={(e) =>
            e.currentTarget.attributes.href.value = 'mailto:' + window.atob('am9uYXNAbGVrZXZpY2l1cy5jb20=')
          } className="flex gap-x-4 rounded-xl transition-all -my-2 -mx-4 py-2 px-4 hover:bg-slate-500/40">
            <figure><EmailIcon /></figure>
            <div>
              <h6 className="font-medium">Email</h6>
              <p className="text-sm text-slate-400">Good ol’.</p>
            </div>
          </a>
        </li>

        <li>
          <Tippy content="Copy to Clipboard" placement='top' arrow={false}>
            <div
              className="flex gap-x-4 rounded-xl transition-all -my-2 -mx-4 py-2 px-4 hover:bg-slate-500/40 cursor-pointer"
              role="link" tabIndex="0" onClick={copyKey} onKeyDown={copyKey}>
              <figure className="w-6 h-6 overflow-hidden shrink-0">
                <div className={`flex flex-col w-6 transition-all ease-[cubic-bezier(0.33,1,0.68,1)] ${iconFlipped ? '-my-6' : ''}`}>
                  <KeyIcon className="w-6 h-6" />
                  <ClipboardCheckIcon className="w-6 h-6" />
                </div>
              </figure>
              <div>
                <h6 className="font-medium">GPG Public Key <span className="font-normal opacity-60">Ed25519</span></h6>
                <p className="font-mono text-sm text-slate-400 break-all">70F9472A8F2D2EC3F31D226630F60BAA75FFD0D7</p>
              </div>
            </div>
          </Tippy>
        </li>

      </ul>
    </div>
  )
}

export default ContactBlock
