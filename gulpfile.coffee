gulp = require 'gulp'

rimraf = require 'gulp-rimraf'

jade = require 'gulp-jade'
gulpsmith = require 'gulpsmith'

stylus = require 'gulp-stylus'
autoprefixer = require 'gulp-autoprefixer'
csso = require 'gulp-csso'

coffee = require 'gulp-coffee'
rigger = require 'gulp-rigger'
uglify = require 'gulp-uglify'

changed = require 'gulp-changed'
imagemin = require 'gulp-imagemin'

watch = require 'gulp-watch'
connect = require 'gulp-connect'

sitemap = require 'gulp-sitemap'
revall = require 'gulp-rev-all'
awspublish = require 'gulp-awspublish'

paths =
  contents: [ 'source/contents/**/*.jade', '!source/content/partials/*.jade' ]
  journalPosts: 'source/contents/journal/*.md'
  stylesheets: 'source/assets/stylesheets/site.styl'
  scripts: 'source/assets/javascripts/site.js'

gulp.task 'clean', (cb) -> del ['build'], cb

gulp.task 'scripts', ['clean'], ->
  gulp.src(paths.scripts)
  .pipe(sourcemaps.init())
  .pipe(coffee())
  .pipe(uglify())
  .pipe(concat('all.min.js'))
  .pipe(sourcemaps.write())
  .pipe(gulp.dest('build/js'))

# Copy all static images
gulp.task 'images', ['clean'], ->
  gulp.src(paths.images)
  .pipe(imagemin({optimizationLevel: 5}))
  .pipe(gulp.dest('build/img'))

gulp.task 'watch', ->
  gulp.watch(paths.scripts, ['scripts'])
  gulp.watch(paths.images, ['images'])

gulp.task 'default', [ 'content', 'stylesheets', 'scripts', 'media' ]

gulp.task 'dev', [ 'clean', 'default', 'connect', 'watch' ]

gulp.task 'build', [ 'clean', 'content:production', 'stylesheets:production', 'scripts:production', 'media:production' ]
gulp.task 'deploy:staging', [ 'build', 'robots:disallow', 'publish:staging' ]
gulp.task 'deploy:production', [ 'build', 'robots:allow', 'publish:production' ]