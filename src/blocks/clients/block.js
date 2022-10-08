import { graphql, useStaticQuery } from 'gatsby'
import clientList from './data.json'
import Tippy from '@tippyjs/react'

const ClientsBlock = ({ classes }) => {
  const clientLogos = useStaticQuery(graphql`
    query { allFile(filter: {absolutePath: {glob: "**/clients/images/*.svg"}}) {
      edges { node {
        absolutePath
        childrenSvg { content { data } } 
      } }
    } }
  `).allFile.edges

  const clientLogoObject = {}
  for (const client of clientLogos) {
    const clientId = client.node.absolutePath.match(/\/([a-zA-Z0-9-]+)\.svg$/)
    if (clientId && clientId[1]) {
      clientLogoObject[clientId[1]] = client.node.childrenSvg[0].content.data
    } else {
      console.error(client.node.absolutePath)
    }
  }

  return (
    <div className={`${classes} bg-white/75 dark:bg-black/40 p-6`}>
      <ul className="grid grid-cols-2 lg:grid-cols-4 -m-2 mb-4 gap-y-6">
        {clientList.clients.map((client) => {
          return <li key={client.name} className="">
            <Tippy content={<>
              <h5><strong>{client.name}</strong></h5>
              <p>{client.contribution}</p>
            </>} placement='top' arrow={false} maxWidth={240}>
              <a href={client.link} className="block rounded-xl -m-2 p-2 hover:bg-slate-300/30 dark:hover:bg-slate-300/10 transition-all">
                <figure
                  className="flex justify-center"
                  key={client.logo}
                  dangerouslySetInnerHTML={{ __html: clientLogoObject[client.logo] }} />
              </a>
            </Tippy>
            <h5 className="hidden">{client.name}</h5>
            <p className="hidden">{client.contribution}</p>
          </li>
        })}
      </ul>
      <p>I have been doing client work of all kinds — websites, apps, branding, games, magazines, videos — for over 15 years. Above are a couple of <strong>clients that I had pleasure to work with</strong>.</p>
      <p className="text-sm mt-2 opacity-50">I am not available for any freelance or contract work.</p>
    </div>
  )
}

export default ClientsBlock

// <ConditionalWrapper
//       condition={link}
//       wrapper={children => <a href={link}>{children}</a>}
//     >
//       <Fragment>
//         <h2>{brand}</h2>
//         <h3>{model}</h3>
//         <img src={image} alt="" />
//         <p>{description}</p>
//         <p>{price}</p>
//       </Fragment>
//     </ConditionalWrapper>

// const ConditionalWrapper = ({ condition, wrapper, children }) => 
//   condition ? wrapper(children) : children;