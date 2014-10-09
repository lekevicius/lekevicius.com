###
Tasks:
  * Fix S3 and VDK ***
  * Journal index and pagination *****
  * Build Journal monthly archive ****
  * Full page template with metadata **
  * Custom stylesheet inclusion **
  * Custom js inclusion **
  * Integrating jQuery plugins: Entree, Retina, Seen, Etc. ***
  - Page color plugin ***
  - Sketches *****
  - Typography ****
  - Responsive menu and navigation ****
###

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

# summarize = (marker) ->
#   through.obj( (file, enc, cb) ->
#     summary = file.contents.toString().split(marker)[0]
#     file.page.summary = summary
#     @push(file);
#     cb()
#   )

# gulp.task 'tags', ['posts'], ->
#   tags()
#   .pipe(applyTemplate('design/tag.html'))
#   .pipe(gulp.dest('build/tag'))



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
gulpJade = require 'gulp-jade'
frontmatter = require 'gulp-front-matter'
minifyHtml = require 'gulp-minify-html'
marked = require 'gulp-marked'

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
revAll = require 'gulp-rev-all'
parallelize = require 'concurrent-transform'
awspublish = require 'gulp-awspublish'

keys = require './config/keys.json'



paths =
  posts: 'source/content/journal/*.md'
  postsMedia: ['source/content/journal/**/*.*', '!source/content/journal/*.md']
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
  descrption: "A personal website of Jonas Lekevicius",
  # 'Journal by Jonas Lekevicius about design, development, technology, how we got to where we are and where we might go next.'
  url: "http://lekevicius.com"
  date: new Date()



## HELPERS ##

rePostName = /(\d{4})-(\d{1,2})-(\d{1,2})-(.*)/

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

filename2date = ->
  through.obj( (file, enc, cb) ->
    basename = path.basename file.path, '.md'
    match = rePostName.exec basename
    if match
      file.page.date = new Date(match[1], match[2], match[3]);
      file.page.url  = "/journal/#{ match[1] }/#{ match[2] }/#{ match[3] }/#{ match[4] }/"
    @push file
    cb()
  )

applyTemplate = (templateFile) ->
  template = jade.compileFile(path.join(__dirname, templateFile))
  through.obj (file, enc, cb) ->
    data =
      site: site
      page: file.page
      content: file.contents.toString()
    file.contents = new Buffer(template(data), 'utf8')
    @push file
    cb()



## TASKS ##

gulp.task 'clean', (cb) -> del ['build'], cb

taskStylesheets = ->
  gulp.src(paths.stylesheets)
  .pipe(sourcemaps.init())
  .pipe(stylus())
  .pipe(autoprefixer())
  .pipe(concat('jl.css'))
  .pipe(csso())
  .pipe(sourcemaps.write())
  .pipe(gulp.dest('build/css'))

  gulp.src(paths.pageStylesheets)
  .pipe(sourcemaps.init())
  .pipe(stylus())
  .pipe(autoprefixer())
  .pipe(csso())
  .pipe(sourcemaps.write())
  .pipe(rename (path) ->
    path.dirname = path.dirname.replace('pages/', '') + "/#{ path.basename }"
    path.basename = 'style'
    path
  )
  .pipe(gulp.dest('build'))

gulp.task 'stylesheets', ['clean'], taskStylesheets
gulp.task 'stylesheets-watch', taskStylesheets


taskScripts = ->
  gulp.src(paths.scripts)
  .pipe(sourcemaps.init())
  .pipe(rigger())
  .pipe(uglify())
  .pipe(concat('jl.js'))
  .pipe(sourcemaps.write())
  .pipe(gulp.dest('build/js'))

  gulp.src(paths.pageScripts)
  .pipe(sourcemaps.init())
  .pipe(coffee())
  .pipe(uglify())
  .pipe(sourcemaps.write())
  .pipe(rename (path) ->
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
  .pipe(frontmatter({ property: 'page', remove: true}))    
  .pipe(filename2date())   
  .pipe(marked())
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
  .pipe(minifyHtml())
  .pipe(gulp.dest('build'))

gulp.task 'posts', ['clean'], taskPosts
gulp.task 'posts-watch', taskPosts


taskPages = ->
  gulp.src(paths.pages)
  .pipe(frontmatter({ property: 'page', remove: true }))
  .pipe(through.obj (file, enc, cb) ->
    data =
      site: site
      page: file.page
    template = jade.compileFile file.path
    file.contents = new Buffer template(data), 'utf8'
    @push file
    cb()
  )
  .pipe(minifyHtml())
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

  headers =
   'Cache-Control': 'max-age=315360000, no-transform, public'

  gulp.src('build/**/*.*')
    .pipe(awspublish.gzip())
    .pipe(parallelize(publisher.publish(headers), 10))
    .pipe(publisher.cache())
    .pipe(publisher.sync()) # delete missing
    .pipe(awspublish.reporter())



## TASK GROUPS ##

gulp.task 'assets', [ 'stylesheets', 'scripts', 'media' ]
gulp.task 'content', [ 'posts', 'pages', 'rss' ]
gulp.task 'content-watch', [ 'posts-watch', 'pages-watch', 'rss-watch' ]

gulp.task 'default', [ 'clean', 'assets', 'content', 'sitemap' ]

gulp.task 'dev', [ 'default', 'watch', 'server' ]
gulp.task 'deploy', [ 'default', 'publish' ]
