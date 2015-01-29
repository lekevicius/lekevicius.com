###
Todo:

Work plan:
  - Everything about navigation incl. Entree
  - Everything about typography
  - Profile page
  - Everything about Journal
  - Homepage, 404 page
  - Launch!
  - Start releasing most important projects

Design:
  - Responsive Navigation
    - Page title areas (title, description, custom-title)
    - Dark variation
    - Current menu item marking
    - JavaScript positioning
    - Entree transitions!
    
  - Usage & Typography

  - Home
  - 404 page
  - Archive
  - Single post

  - Plugins:
    - Footnote Popover
    - Pixel Loupe
    - Zoombox
    - Entree

Content:
  - First post
  - Profile
  - Projects
    - jQuery Entree
    - jQuery Pixel Loupe
    - jQuery Seen
    - jQuery Footnote Popover
    - jQuery Zoombox
    - Air Drawing
    - ReadSprint
    - UIKit.Stylus
    - Email Printer
    - Postcards
    - Spelltower AI
    - Letterpress AI
    - Amora
    - Sound Shapes
    - ARDrone + Leap Motion
    - App Design Guide
    - Vijual
    - Pile of Days
    - Coffee Package
    - Login Trailer
    - Movie Word History
    - ...

Future Features:
  - Journal tags with paginated tag pages
  - Better site search index and features
  - Zoombox navigation between images
  - Zoombox swipe navigation
  - Zoombox captions

###



## REQUIRES & CONFIG ##

gulp = require 'gulp'
http = require 'http'
path = require 'path'

# General utilities
_ = require 'lodash'
del = require 'del'
sourcemaps = require 'gulp-sourcemaps'
concat = require 'gulp-concat'
rename = require 'gulp-rename'
gutil = require 'gulp-util'
through = require 'through2'
gulpif = require 'gulp-if'
gulpfilter = require 'gulp-filter'

# HTML and Journal
jade = require 'jade'
frontmatter = require 'gulp-front-matter'
minifyhtml = require 'gulp-minify-html'
marked = require 'gulp-marked'
markdown = require('js-markdown-extra').Markdown
moment = require 'moment'
highlight = require 'gulp-highlight'
cheerio = require 'cheerio'
lunr = require 'lunr'
html2plaintext = require 'html2plaintext'

# CSS
stylus = require 'gulp-stylus'
autoprefixer = require 'gulp-autoprefixer'
csso = require 'gulp-csso'

# JavaScript
coffee = require 'gulp-coffee'
rigger = require 'gulp-rigger'
uglify = require 'gulp-uglify'

# Images
changed = require 'gulp-changed'
imagemin = require 'gulp-imagemin'
imageresize = require 'gulp-image-resize'

# Development
watch = require 'gulp-watch'
livereload = require 'gulp-livereload'
webserver = require 'gulp-webserver'

# Deployment
sitemap = require 'gulp-sitemap'
revall = require 'gulp-rev-all'
parallelize = require 'concurrent-transform'
awspublish = require 'gulp-awspublish'

keys = require './config/keys.json'


paths =
  posts: 'source/content/journal/*.md'
  pages: 'source/content/pages/**/*.jade'
  templates: 'source/assets/templates/**/*.jade'
  stylesheets: 'source/assets/stylesheets/site.styl'
  siteStylesheets: 'source/assets/stylesheets/**/*.styl'
  contentStylesheets: 'source/content/**/*.styl'
  scripts: 'source/assets/scripts/site.js'
  siteScripts: 'source/assets/scripts/**/*.+(js|coffee)'
  contentScripts: 'source/content/**/*.coffee'
  siteImages: 'source/assets/images/**/*.+(png|jpg|gif|svg)'
  contentImages: [ 'source/content/**/*.+(png|jpg|gif|svg)' ]
  siteAssets: [ 'source/assets/images/**/*.*', '!source/assets/images/**/*.+(png|jpg|gif|svg)' ]
  contentAssets: [ 'source/content/**/*.*', '!source/content/**/*.+(jade|styl|coffee|png|jpg|gif|svg)' ]
  fonts: 'source/assets/fonts/**/*'
  icons: 'source/assets/icons/**/*'

site =
  title: "Jonas Lekevicius",
  author: "Jonas Lekevicius",
  email: "jonas@lekevicius.com",
  description: "A personal website of Jonas Lekevicius",
  # 'Journal by Jonas Lekevicius about design, development, technology, how we got to where we are and where we might go next.'
  url: "http://lekevicius.com"
  date: new Date()
  index: lunr ->
    @field 'title', { boost: 10 }
    @field 'body'
    @ref 'path'

minifyHtmlOptions = { comments: true, conditionals: true, cdata: true, quotes: true }
imageminOptions = { optimizationLevel: 3, progressive: true, svgoPlugins: [{ removeDesc: true }] }

rePostName = /(\d{4})-(\d{1,2})-(\d{1,2})-(.*)/



## HELPERS ##



jade.filters.escape = (block) ->
  block
  .replace /&/g, '&amp;'
  .replace /</g, '&lt;'
  .replace />/g, '&gt;'
  .replace /"/g, '&quot;'
  .replace /#/g, '&#35;'
  .replace /\\/g, '\\\\'
  .replace /\n/g, '\\n'


collectPosts = ->
  posts = []
  tags = []

  through.obj (file, enc, cb) ->

    posts.push file.page
    posts[posts.length - 1].content = file.contents.toString()

    if file.page.tags
      tags.push tag for tag in file.page.tags when tags.indexOf(tag) is -1

    @push file
    cb()

  , (cb) ->
    posts.sort (a, b) -> b.date - a.date
    site.posts = posts
    site.postsByMonth = _.groupBy site.posts, (post) -> moment(post.date).format("MMMM YYYY")
    site.tags = tags
    cb()

setPostMetadata = ->
  through.obj( (file, enc, cb) ->
    basename = path.basename file.path, '.md'
    match = rePostName.exec basename
    if match
      if file.page.date
        file.page.date = moment(file.page.date, ['YYYY-MM-DD', 'YYYY-MM-DD HH:mm'])
      else
        file.page.date = moment({ year: parseInt(match[1]), month: parseInt(match[2]) - 1, day: parseInt(match[3]) })
      file.page.url  = "/journal/#{ match[1] }/#{ match[2] }/#{ match[3] }/#{ match[4] }/"
      file.page.readingTime = Math.max( Math.round(file.contents.toString().split(' ').length / 200.0), 1 )
    @push file
    cb()
  )

setPageMetadata = ->
  through.obj( (file, enc, cb) ->
    basename = path.basename file.path, '.jade'
    dirname = path.dirname(file.path).replace(process.cwd(), '').replace('/source/content/pages', '')
    dirname = dirname.slice(1) if dirname.charAt(0) == '/'
    if dirname == '' and (basename == 'index' or basename == '404')
      file.page.url = "/"
    else if dirname == ''
      file.page.url = "/#{ basename }/"
    else
      file.page.url = "/#{ dirname }/#{ basename }/"
    @push file
    cb()
  )

applyTemplate = (templateFile) ->
  template = jade.compileFile(path.join(__dirname, templateFile))
  through.obj (file, enc, cb) ->
    data =
      site: site
      page: file.page
      file: file
      helpers: helpers
      content: file.contents.toString()
    file.contents = new Buffer(template(data), 'utf8')
    @push file
    cb()

summarize = () ->
  through.obj (file, enc, cb) ->
    fileContents = file.contents.toString()
    if cheerio('p', fileContents).length
      file.page.summary = cheerio('p:first-of-type', fileContents).html()
    @push file
    cb()


journalPages = ->
  stream = through.obj (file, enc, cb) ->
    @push file
    cb()
  
  postsPerPage = 2
  totalPages = Math.ceil site.posts.length / postsPerPage

  for pageNumber in [1..totalPages]

    file = new gutil.File
      path: path.join(__dirname, ( if pageNumber is 1 then "./journal/index.html" else "./journal/page/#{ pageNumber }/index.html" )),
      contents: new Buffer('')

    file.page =
      title: 'Journal'
      totalPages: totalPages
      currentPage: pageNumber
      nextPageURL: ( if pageNumber < totalPages then "/journal/page/#{ pageNumber + 1 }/" else null )
      previousPageURL: ( if pageNumber > 1 then ( if pageNumber == 2 then "/journal/" else "/journal/page/#{ pageNumber - 1 }/" ) else null )
      posts: site.posts.slice( (pageNumber - 1) * postsPerPage, (pageNumber - 1) * postsPerPage + postsPerPage )
      url: ( if pageNumber is 1 then "/journal/" else "/journal/page/#{ pageNumber }/" )

    if pageNumber is 1
      file.page.description = """Occasional <a href="/">articles</a>, <a href="/">links</a> and <a href="/">remarks</a> about <a href="/">design</a>, <a href="/">technology</a> and <a href="/">media</a>.<br> You can <a href="/">browse the archive</a> or subscribe by RSS (<a href="/">everything</a> or <a href="/">just articles</a>)."""

    stream.write file
  
  stream.end()
  stream.emit "end"
  stream


# tags = ->
#   stream = through.obj (file, enc, cb) ->
#     @push file
#     cb()
    
#   if site.tags
#     site.tags.forEach (tag) ->
#       file = new gutil.File
#         path: tag + '.html',
#         contents: new Buffer('')
#       file.page = { title: tag, tag: tag }
#       stream.write file
  
#   stream.end()
#   stream.emit "end"
#   stream

# gulp.task 'tags', ['posts'], ->
#   tags()
#   .pipe(applyTemplate('design/tag.html'))
#   .pipe(gulp.dest('build/tag'))



helpers = 
  rePostName: rePostName
  fs: require('fs')
  crypto: require('crypto')
  color: require('color')
  moment: moment
  _: _



## TASKS ##

gulp.task 'clean', (cb) -> del ['build'], cb

taskStylesheets = ->
  gulp.src(paths.stylesheets)
  # .pipe(sourcemaps.init())
  .pipe(stylus())
  .pipe(autoprefixer())
  .pipe(concat('jl.css'))
  .pipe(csso())
  # .pipe(sourcemaps.write())
  .pipe(gulp.dest('build/css'))

  gulp.src(paths.contentStylesheets)
  # .pipe(sourcemaps.init())
  .pipe(stylus())
  .pipe(autoprefixer())
  .pipe(csso())
  # .pipe(sourcemaps.write())
  .pipe(rename (path) ->
    match = rePostName.exec path.basename
    if match
      path.dirname = "journal/#{ match[1] }/#{ match[2] }/#{ match[3] }/#{ match[4] }"
    else
      path.dirname = path.dirname.replace('pages/', '') + "/#{ path.basename }"
    path.basename = 'style'
    path
  )
  .pipe(gulp.dest('build'))

gulp.task 'stylesheets', ['clean'], taskStylesheets
gulp.task 'stylesheets-watch', taskStylesheets


taskScripts = ->
  gulp.src(paths.scripts)
  # .pipe(sourcemaps.init())
  .pipe(rigger())
  .pipe(uglify())
  .pipe(concat('jl.js'))
  # .pipe(sourcemaps.write())
  .pipe(gulp.dest('build/js'))

  gulp.src(paths.contentScripts)
  # .pipe(sourcemaps.init())
  .pipe(coffee())
  .pipe(uglify())
  # .pipe(sourcemaps.write())
  .pipe(rename (path) ->
    match = rePostName.exec path.basename
    if match
      path.dirname = "journal/#{ match[1] }/#{ match[2] }/#{ match[3] }/#{ match[4] }"
    else
      path.dirname = path.dirname.replace('pages/', '') + "/#{ path.basename }"
    path.basename = 'script'
    path
  )
  .pipe(gulp.dest('build'))

gulp.task 'scripts', ['clean'], taskScripts
gulp.task 'scripts-watch', taskScripts


taskMedia = ->

  # Assets

  contentPathRename = (path) ->
    match = rePostName.exec path.dirname
    if match
      path.dirname = "journal/#{ match[1] }/#{ match[2] }/#{ match[3] }/#{ match[4] }"
    else
      path.dirname = path.dirname.replace('pages/', '')
    path

  gulp.src(paths.siteAssets, { base: 'source/assets/images' })
  .pipe(gulp.dest('build/img'))

  gulp.src(paths.contentAssets, { base: 'source/content' })
  .pipe(rename(contentPathRename))
  .pipe(gulp.dest('build'))

  # Images

  gulp.src(paths.siteImages, { base: 'source/assets/images' })
  .pipe(gulpfilter('**/*@2x*'))
  .pipe(imageresize({ width: '50%' }))
  # .pipe(imagemin(imageminOptions))
  .pipe(rename (path) ->
    path.basename = path.basename.replace '@2x', ''
    path
  )
  .pipe(gulp.dest('build/img'))

  gulp.src(paths.siteImages, { base: 'source/assets/images' })
  # .pipe(imagemin(imageminOptions))
  .pipe(gulp.dest('build/img'))

  gulp.src(paths.contentImages, { base: 'source/content' })
  .pipe(gulpfilter('**/*@2x*'))
  .pipe(rename(contentPathRename))
  .pipe(imageresize({ width: '50%' }))
  # .pipe(imagemin(imageminOptions))
  .pipe(rename (path) ->
    path.basename = path.basename.replace '@2x', ''
    path
  )
  .pipe(gulp.dest('build'))

  gulp.src(paths.contentImages, { base: 'source/content' })
  .pipe(rename(contentPathRename))
  # .pipe(imagemin(imageminOptions))
  .pipe(gulp.dest('build'))

  # Fonts
  gulp.src(paths.fonts)
  .pipe(gulp.dest('build/fonts'))

  # Icons
  gulp.src(paths.icons)
  .pipe(gulp.dest('build'))

  gulp.src(['source/assets/humans.txt', 'source/assets/robots.txt', 'source/assets/crossdomain.xml'])
  .pipe(gulp.dest('build'))

gulp.task 'media', ['clean'], taskMedia
gulp.task 'media-watch', taskMedia


taskPosts = ->
  gulp.src(paths.posts)
  .pipe(frontmatter({ property: 'page', remove: true }))    
  .pipe(setPostMetadata())   
  # .pipe(marked())
  .pipe(through.obj (file, enc, cb) ->
    file.contents = new Buffer markdown(file.contents.toString()), 'utf8'
    @push file
    cb()
  )
  .pipe(highlight())
  .pipe(summarize()) # '<!--more-->'
  .pipe(rename (path) ->
    path.extname = ".html"
    match = rePostName.exec path.basename
    if match
      path.dirname = "journal/#{ match[1] }/#{ match[2] }/#{ match[3] }/#{ match[4] }"
      path.basename = 'index'
    path
  )
  .pipe(collectPosts())
  .pipe(applyTemplate('source/assets/templates/journal-entry.jade'))
  .pipe(minifyhtml(minifyHtmlOptions))
  .pipe(gulp.dest('build'))

gulp.task 'posts', ['clean'], taskPosts
gulp.task 'posts-watch', taskPosts


taskPages = ->
  gulp.src(paths.pages)
  .pipe(frontmatter({ property: 'page', remove: true }))
  .pipe(setPageMetadata())
  .pipe(through.obj (file, enc, cb) ->
    data =
      site: site
      page: file.page
      file: file
      helpers: helpers
    template = jade.compileFile file.path
    file.contents = new Buffer template(data), 'utf8'
    @push file
    cb()
  )
  .pipe(minifyhtml(minifyHtmlOptions))
  .pipe(rename (path) ->
    fullPath = path.dirname + '/' + path.basename + path.extname
    if fullPath in [ './404.jade', './index.jade' ]
      path.extname = '.html'
      return path
    path.dirname += "/#{ path.basename }"
    path.basename = 'index'
    path.extname = '.html'
    path
  )
  .pipe(gulp.dest('build'))

gulp.task 'pages', ['posts'], taskPages
gulp.task 'pages-watch', ['posts-watch'], taskPages


taskIndex = ->

  fileStream = ->
    stream = through.obj (file, enc, cb) ->
      @push file
      cb()

    file = new gutil.File
      path: path.join(__dirname, "search.json"),
      contents: new Buffer JSON.stringify(site.index.toJSON()), 'utf8'

    stream.write file
    stream.end()
    stream.emit "end"
    stream

  gulp.src('build/**/*.html', { base: 'build' })
  .pipe(through.obj (file, enc, cb) ->
    fileContents = file.contents.toString()
    bodyContent = cheerio('body', fileContents)
    bodyContent.remove('script')
    bodyContent.remove('pre code')
    console.log html2plaintext(bodyContent.html())
    site.index.add
      path: file.path
      title: cheerio('title', fileContents).text()
      body: html2plaintext(bodyContent.html())
    @push file
    cb()
  , (cb) ->
    fileStream()
    .pipe(gulp.dest('build'))
    cb()
  )

gulp.task 'index', ['pages'], taskIndex
gulp.task 'index-watch', ['pages-watch'], taskIndex


taskPagination = ->
  journalPages()
  .pipe(applyTemplate('source/assets/templates/journal-page.jade'))
  .pipe(minifyhtml(minifyHtmlOptions))
  .pipe(gulp.dest('build'))

gulp.task 'pagination', ['posts'], taskPagination
gulp.task 'pagination-watch', ['posts-watch'], taskPagination


taskArchive = ->
  gulp.src(['source/assets/templates/archive.jade'])
  .pipe(through.obj (file, enc, cb) ->
    data =
      site: site
      helpers: helpers
      file: file
      page:
        title: 'Archive'
        url: '/journal/archive/'
    template = jade.compileFile(file.path)
    file.contents = new Buffer(template(data), 'utf8')
    @push file
    cb()
  )
  .pipe(rename('journal/archive/index.html'))
  .pipe(gulp.dest('build'))

gulp.task 'archive', ['posts'], taskArchive
gulp.task 'archive-watch', ['posts-watch'], taskArchive


taskRSS = ->
  gulp.src(['source/assets/templates/feed.jade'])
  .pipe(through.obj (file, enc, cb) ->
    data =
      site: site
      page: {} # empty object that can be extended as needed
    template = jade.compileFile(file.path)
    file.contents = new Buffer(template(data), 'utf8')
    @push file
    cb()
  )
  .pipe(rename('feed.xml'))
  .pipe(gulp.dest('build'))

gulp.task 'rss', ['posts'], taskRSS
gulp.task 'rss-watch', ['posts-watch'], taskRSS


taskSitemap = ->
  gulp.src('build/**/*.html')
  .pipe(sitemap({ siteUrl: site.url }))
  .pipe(gulp.dest('build'))

gulp.task 'sitemap', ['content'], taskSitemap
gulp.task 'sitemap-watch', ['content-watch'], taskSitemap



## DEVELOPMENT TASKS ##

gulp.task 'watch', ['default'], ->
  gulp.watch [ paths.siteStylesheets, paths.contentStylesheets ], [ 'stylesheets-watch' ]
  gulp.watch [ paths.siteScripts, paths.contentScripts ], ['scripts-watch']
  gulp.watch [ paths.siteAssets, paths.contentAssets, paths.siteImages, paths.contentImages, paths.fonts, paths.icons ], ['media-watch']
  gulp.watch [ paths.posts, paths.pages, paths.templates ], ['content-watch', 'sitemap-watch']

gulp.task 'server', ['default'], ->
  gulp.src('build')
  .pipe(webserver({
    livereload: true
    open: true
  }))



## DEPLOYMENT TASKS ##

gulp.task 'publish', ['default'], ->
  publisher = awspublish.create keys

  gulp.src('build/**/*.*')
    # .pipe(revall({ ignore: [ '.html', '.xml', '.txt' ] }))
    # .pipe(gulp.dest('build'))
    .pipe(awspublish.gzip())
    .pipe(parallelize(publisher.publish(), 10))
    .pipe(publisher.cache())
    .pipe(publisher.sync()) # delete missing
    .pipe(awspublish.reporter())



## TASK GROUPS ##

gulp.task 'assets', [ 'stylesheets', 'scripts', 'media' ]
gulp.task 'content', [ 'posts', 'pagination', 'pages', 'archive', 'rss' ]
gulp.task 'content-watch', [ 'posts-watch', 'pagination-watch', 'pages-watch', 'archive-watch', 'rss-watch' ]

gulp.task 'default', [ 'clean', 'assets', 'content', 'sitemap' ]

gulp.task 'dev', [ 'default', 'watch', 'server' ]
gulp.task 'deploy', [ 'default', 'publish' ]
