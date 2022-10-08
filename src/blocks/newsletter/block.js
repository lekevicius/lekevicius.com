const NewsletterBlock = ({ classes }) => {
  return (
    <div className={`${classes} bg-white/75 dark:bg-black/40 p-6 flex flex-col lg:flex-row lg:space-x-6`}>

      <p className="shrink-0">
        <strong>Every month I share my learnings in my <a href="https://buttondown.email/lekevicius">newsletter</a>.</strong> <br className="hidden lg:inline" />
        You should sign up. Or, check <a href="https://buttondown.email/lekevicius/archive/">previous issues</a> first.
      </p>
      <form
        action="https://buttondown.email/api/emails/embed-subscribe/lekevicius"
        method="post"
        target="popupwindow"
        onSubmit={() => window.open('https://buttondown.email/lekevicius', 'popupwindow')}
        className="lg:grow flex flex-col lg:flex-row mt-4 lg:m-0"
      >
        <label htmlFor="bd-email" className="hidden">Enter your email</label>
        <input type="email" name="email" placeholder="Email address"
          className="block grow rounded-lg px-4 py-2 tracking-tight bg-slate-400/20" />
        <input type="submit" value="Subscribe"
          className="block shrink-0 rounded-lg tracking-tight font-bold bg-slate-500 
          hover:bg-slate-600 transition-all mt-4 lg:mt-0 lg:ml-4 text-white px-4 py-2 cursor-pointer" />
      </form>
    </div>
  )
}

export default NewsletterBlock
