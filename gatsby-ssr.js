import Layout from './src/templates/Layout'

export const wrapPageElement = ({ element, props }) => {
  return <Layout {...props}>{element}</Layout>
}

export const onRenderBody = ({
  setHtmlAttributes,
  setBodyAttributes
}) => {
  setHtmlAttributes({
    lang: "en",
    dir: "ltr",
    prefix: "og: http://ogp.me/ns# article: http://ogp.me/ns/article#"
  })
}