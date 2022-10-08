import { graphql, useStaticQuery } from 'gatsby'
import socialLinks from './data.json'
import BackgroundImg from './images/background.svg'

const SocialBlock = ({ classes }) => {
  const linkIcons = useStaticQuery(graphql`
    query { allFile(filter: {absolutePath: {glob: "**/social/images/*.svg"}}) {
      edges { node {
        absolutePath
        childrenSvg { content { data } }
      } }
    } }
  `).allFile.edges

  const linkIconObject = {}
  for (const link of linkIcons) {
    const linkId = link.node.absolutePath.match(/\/([a-zA-Z0-9-]+)\.svg$/)
    if (linkId && linkId[1]) {
      linkIconObject[linkId[1]] = link.node.childrenSvg[0].content.data
    } else {
      console.error(link.node.absolutePath)
    }
  }
  return (
    <div className={`${classes} bg-white/75 dark:bg-black/50 bg-cover bg-right p-6`} style={{ backgroundImage: `url(${BackgroundImg})` }}>
      <ul className="flex flex-col gap-y-4">
        {socialLinks.map((link) => {
          return <li key={link.title}>
            <a href={link.link} className="flex gap-x-4 rounded-xl transition-all -my-2 -mx-4 py-2 px-4 hover:bg-slate-300/30 dark:hover:bg-slate-500/20">
              <figure dangerouslySetInnerHTML={{ __html: linkIconObject[link.icon] }} />
              <div>
                <h6 className="font-medium">{link.title}</h6>
                <p className="text-sm text-slate-500 dark:text-slate-400">{link.description}</p>
              </div>
            </a>
          </li>
        })}
      </ul>
    </div>
  )
}

export default SocialBlock
