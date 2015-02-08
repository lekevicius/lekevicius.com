###
Todo:

Design and content:
  - Homepage
  - Journal index and pages
  - Journal entry
  - Profile
  - 404
  - First post

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
typogr = require 'gulp-typogr'
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
webserver = require 'gulp-webserver'

# Deployment
sitemap = require 'gulp-sitemap'
revall = require 'gulp-rev-all'
parallelize = require 'concurrent-transform'
awspublish = require 'gulp-awspublish'
# s3 = require 'gulp-s3'
# gzip = require 'gulp-gzip'

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
  contentAssets: [ 'source/content/**/*.*', '!source/content/**/*.+(md|jade|styl|coffee|png|jpg|gif|svg)' ]
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
      file.page.bodyclass = if file.page.bodyclass then file.page.bodyclass + ' journal-entry' else 'journal-entry'
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
    if not file.page.summary and cheerio('p', fileContents).length
      file.page.summary = cheerio('p:first-of-type', fileContents).html()
    @push file
    cb()


journalPages = ->
  stream = through.obj (file, enc, cb) ->
    @push file
    cb()
  
  postsPerPage = 20
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
      bodyclass: 'journal-page'

    if pageNumber is 1
      file.page.description = """Occasional articles and links about design, technology and media.<br> You can subscribe by RSS (<a href="/feed.xml">everything</a> or <a href="/feed-articles.xml">just articles</a>)."""
      # <a href="/journal/archive/">browse the archive</a> or 

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

    suffix = moment(file.page.date).format('-YYYY-MM-DD')
    textContents = file.contents.toString()
    textContents = textContents.replace /\[\^([a-z0-9]+)\]/ig, "[^$1#{ suffix }]"
    
    file.contents = new Buffer markdown(textContents), 'utf8'
    @push file
    cb()
  )
  .pipe(highlight())
  .pipe(typogr())
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
  .pipe(highlight())
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
      page: { includeLinks: true } # empty object that can be extended as needed
    template = jade.compileFile(file.path)
    file.contents = new Buffer(template(data), 'utf8')
    @push file
    cb()
  )
  .pipe(rename('feed.xml'))
  .pipe(gulp.dest('build'))

  gulp.src(['source/assets/templates/feed.jade'])
  .pipe(through.obj (file, enc, cb) ->
    data =
      site: site
      page: { includeLinks: false } # empty object that can be extended as needed
    template = jade.compileFile(file.path)
    file.contents = new Buffer(template(data), 'utf8')
    @push file
    cb()
  )
  .pipe(rename('feed-articles.xml'))
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

gulp.task 'publish', ->
  publisher = awspublish.create keys

  gulp.src('build/**/*.*')
  # .pipe(revall({ ignore: [ '.html', '.xml', '.txt' ] }))
  # .pipe(gulp.dest('build'))
  .pipe(awspublish.gzip())
  .pipe(parallelize(publisher.publish(), 10))
  .pipe(publisher.cache())
  .pipe(publisher.sync()) # delete missing
  .pipe(awspublish.reporter())

    # gulp.src('build/**/*.*')
    # .pipe(gzip())
    # .pipe(s3({
    #     key: keys.key
    #     secret: keys.secret
    #     bucket: keys.bucket
    #     region: 'us-east-1'
    #   }, {
    #     headers: { 'Cache-Control': 'max-age=315360000, no-transform, public' }
    #     gzippedOnly: true
    #   }))
    # # .pipe(publisher.cache())
    # # .pipe(publisher.sync()) # delete missing
    # # .pipe(awspublish.reporter())



## TASK GROUPS ##

gulp.task 'assets', [ 'stylesheets', 'scripts', 'media' ]
gulp.task 'content', [ 'posts', 'pagination', 'pages', 'rss' ] # 'archive', 
gulp.task 'content-watch', [ 'posts-watch', 'pagination-watch', 'pages-watch', 'archive-watch', 'rss-watch' ]

gulp.task 'default', [ 'clean', 'assets', 'content', 'sitemap' ]

gulp.task 'dev', [ 'default', 'watch', 'server' ]
gulp.task 'deploy', [ 'default', 'publish' ]
