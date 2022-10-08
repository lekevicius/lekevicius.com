import { graphql, useStaticQuery } from 'gatsby'
import experienceData from './data.json'

const ResumeSection = ({ section }) => {
  const resumeLogos = useStaticQuery(graphql`
    query { allFile(filter: {absolutePath: {glob: "**/resume/images/*.svg"}}) {
      edges { node {
        absolutePath
        childrenSvg { content { data } } 
      } }
    } }
  `).allFile.edges

  const logoObject = {}
  for (const logo of resumeLogos) {
    const logoId = logo.node.absolutePath.match(/\/([a-zA-Z0-9-]+)\.svg$/)
    if (logoId && logoId[1]) {
      logoObject[logoId[1]] = logo.node.childrenSvg[0].content.data
    } else {
      console.error(logo.node.absolutePath)
    }
  }

  return (
    <div className="not-prose"><ul className="list-none pl-0 m-0 mt-12">
      {experienceData[section].map((item) => {
        return <li key={item.name} className="flex flex-col lg:flex-row gap-2 lg:gap-8 mb-12">
          <figure
            className=" bg-slate-300/20 dark:bg-slate-300/10 py-4 h-[96px] rounded-lg flex justify-center"
            key={item.logo}
            dangerouslySetInnerHTML={{ __html: logoObject[item.logo] }} />
          <div>
            {
              item.link ?
              <a href={item.link}><h4 className="font-bold underline underline-offset-2">{item.place}</h4></a> :
              <h4 className="font-bold">{item.place}</h4>
            }
            <h5>{item.role}</h5>
            <h6 className="text-sm mt-1 opacity-80">{item.time}</h6>
            <p className="mt-3 opacity-80">{item.description}</p>
            {
              item.achievements && item.achievements.length > 0 &&
              <ul className="list-disc mt-4 pl-4 opacity-80">{
                item.achievements.map((achievement) => <li>{achievement}</li>)
              }</ul>
            }
          </div>
        </li>
      })}
    </ul></div>
  )
}

export default ResumeSection

// <ConditionalWrapper
//       condition={link}
//       wrapper={children => <a href={link}>{children}</a>}
//     >
// block rounded-xl -m-2 p-2 hover:bg-slate-300/30 dark:hover:bg-slate-300/10 transition-all
// grid grid-cols-2 lg:grid-cols-4 -m-2 mb-4 gap-y-6
// place role time description
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


// {
//   "logo": "nc",
//   "place": "nc",
//   "role": "Founder, CEO",
//   "time": "2022 - Present",
//   "description": "Created a promotional hardware product, interactive music cube, that toured multiple countries over a summer."
// },