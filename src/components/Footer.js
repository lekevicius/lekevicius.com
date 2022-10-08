const Footer = ({ isIndex = false }) => {
  return (
    <footer className={`${isIndex ? 'p-6' : 'p-6 lg:p-16'} pt-10 pb-16 flex flex-col gap-3 text-sm text-slate-800 dark:text-slate-200 opacity-60`}>
      <p><strong>Lekevicius v7.</strong></p>
      <p>
        Inspired by <a href="http://worrydream.com">Bret Victor</a> and <a href="https://ibuildmyideas.com/">Jordan Singer</a>.
      </p>
      <p>
        Typeset in <a href="https://rsms.me/inter/">Inter</a>.
        Built using <a href="https://www.gatsbyjs.com/">Gatsby</a>.
        Full details in my <a href="/humans.txt">humans.txt</a>.
      </p>
      <p>
        This website is available on IPFS as <a href="https://jonas.eth.link">jonas.eth</a>.
      </p>
      <p>© Jonas Lekevicius 2005-{new Date(Date.now()).getFullYear()}.</p>
    </footer>
  )
}

export default Footer
