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

# summarize = (marker) ->
#   through.obj( (file, enc, cb) ->
#     summary = file.contents.toString().split(marker)[0]
#     file.page.summary = summary
#     @push(file);
#     cb()
#   )


## REQUIRES & CONFIG ##

gulp = require 'gulp'
http = require 'http'
path = require 'path'

# General utilities
del = require 'del'
sourcemaps = require 'gulp-sourcemaps'
concat = require 'gulp-concat'
rename = require 'gulp-rename'
gutil = require 'gulp-util'
through = require 'through2'

# HTML and Journal
jade = require 'jade'
frontmatter = require 'gulp-front-matter'
minifyHtml = require 'gulp-minify-html'
marked = require 'gulp-marked'
markdownExtra = require('js-markdown-extra').Markdown

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
  postsMedia: ['source/content/journal/**/*.*', '!source/content/journal/*.+(md|styl|coffee)']
  pages: 'source/content/pages/**/*.jade'
  pagesMedia: ['source/content/pages/**/*.*', '!source/content/pages/**/*.+(jade|styl|coffee)']
  stylesheets: 'source/assets/stylesheets/site.styl'
  allStylesheets: 'source/assets/stylesheets/**/*.styl'
  pageStylesheets: 'source/content/**/*.styl'
  scripts: 'source/assets/scripts/site.js'
  allScripts: 'source/assets/scripts/**/*.+(js|coffee)'
  pageScripts: 'source/content/**/*.coffee'
  images: 'source/assets/images/**/*'
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

minifyHtmlOptions = { comments: true, conditionals: true, cdata: true, quotes: true }

rePostName = /(\d{4})-(\d{1,2})-(\d{1,2})-(.*)/



## HELPERS ##

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
    site.tags = tags
    cb()

setPostMetadata = ->
  through.obj( (file, enc, cb) ->
    basename = path.basename file.path, '.md'
    match = rePostName.exec basename
    if match
      file.page.date = new Date(match[1], match[2], match[3]);
      file.page.url  = "/journal/#{ match[1] }/#{ match[2] }/#{ match[3] }/#{ match[4] }/"
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

    stream.write file
  
  stream.end()
  stream.emit "end"
  stream



helpers = 
  rePostName: rePostName
  fs: require('fs')
  crypto: require('crypto')
  color: require('color')



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

  gulp.src(paths.pageStylesheets)
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

  gulp.src(paths.pageScripts)
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
  # Posts media
  gulp.src(paths.postsMedia, { base: 'source/content' })
  .pipe(rename (path) ->
    match = rePostName.exec path.dirname
    path.dirname = "journal/#{ match[1] }/#{ match[2] }/#{ match[3] }/#{ match[4] }" if match
    path
  )
  .pipe(gulp.dest('build'))

  # Pages media
  gulp.src(paths.pagesMedia, { base: 'source/content/pages' })
  .pipe(gulp.dest('build'))

  # Images
  gulp.src(paths.images)
  # .pipe(imagemin({optimizationLevel: 5}))
  .pipe(gulp.dest('build/img'))

  # Fonts
  gulp.src(paths.fonts)
  .pipe(gulp.dest('build/fonts'))

  # Icons
  gulp.src(paths.icons)
  .pipe(gulp.dest('build'))

  gulp.src(['source/assets/humans.txt', 'source/assets/robots.txt']).pipe(gulp.dest('build'))

gulp.task 'media', ['clean'], taskMedia
gulp.task 'media-watch', taskMedia


taskPosts = ->
  gulp.src(paths.posts)
  .pipe(frontmatter({ property: 'page', remove: true }))    
  .pipe(setPostMetadata())   
  # .pipe(marked())
  .pipe(through.obj (file, enc, cb) ->
    file.contents = new Buffer markdownExtra(file.contents.toString()), 'utf8'
    @push file
    cb()
  )
  # .pipe(summarize('<!--more-->'))
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
  .pipe(minifyHtml(minifyHtmlOptions))
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
  .pipe(minifyHtml(minifyHtmlOptions))
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


taskPagination = ->
  journalPages()
  .pipe(applyTemplate('source/assets/templates/journal-page.jade'))
  .pipe(minifyHtml(minifyHtmlOptions))
  .pipe(gulp.dest('build'))

gulp.task 'pagination', ['posts'], taskPagination
gulp.task 'pagination-watch', ['posts-watch'], taskPagination


taskRSS = ->
  gulp.src(['source/assets/templates/feed.xml.jade'])
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
  gulp.watch [ paths.allStylesheets, paths.pageStylesheets ], ['stylesheets-watch']
  gulp.watch [ paths.allScripts, paths.pageScripts ], ['scripts-watch']
  gulp.watch [ paths.postsMedia, paths.pagesMedia, paths.images, paths.fonts, paths.icons ], ['media-watch']
  gulp.watch [ paths.posts, paths.pages ], ['content-watch', 'sitemap-watch']

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
    # .pipe(revall())
    .pipe(awspublish.gzip())
    .pipe(parallelize(publisher.publish(), 10))
    .pipe(publisher.cache())
    .pipe(publisher.sync()) # delete missing
    .pipe(awspublish.reporter())



## TASK GROUPS ##

gulp.task 'assets', [ 'stylesheets', 'scripts', 'media' ]
gulp.task 'content', [ 'posts', 'pagination', 'pages', 'rss' ]
gulp.task 'content-watch', [ 'posts-watch', 'pagination-watch', 'pages-watch', 'rss-watch' ]

gulp.task 'default', [ 'clean', 'assets', 'content', 'sitemap' ]

gulp.task 'dev', [ 'default', 'watch', 'server' ]
gulp.task 'deploy', [ 'default', 'publish' ]
