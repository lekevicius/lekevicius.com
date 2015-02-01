$.fn.classList = () -> $(this).attr('class').split(/\s+/)
$.preload = (url, callback) -> $('<img/>').attr({ src: url }).load callback
delay = (time, func) -> setTimeout func, time

menuFullWidth = 640
isFullMenu = ( window.outerWidth >= menuFullWidth )
pageTransitionDone = null
colorTransitionDone = () -> pageTransitionDone() if pageTransitionDone isnt null

$ ->
  $('html').removeClass('no-js').addClass('js')

  $(document).on 'click', '.menu-button', ->
    $('.site-header').toggleClass 'open'

  setNavigationPositions()
  delay 10, -> setNavigationPositions()

  $('#content').retina()
  $('a[rel=footnote]').footnotePopover()
  $('.unseen').trackAppearance()
  $('.unseen').on 'seen', -> console.log @

  # Styling for iOS Homescreen app
  # if (window.navigator.standalone) then $('#container > header .header-inner').attr('style', 'padding-top: 32px')

  # # Pusher setup
  $('#color').on 'webkitTransitionEnd transitionend msTransitionEnd oTransitionEnd', colorTransitionDone

  $(document).entree
    fragment: '#content'
    debug: true

    before: (done) ->
      setFutureCurrentMenuItem @state.url
      $('.site-header').removeClass 'open'
      setNavigationPositions()

      unless @popstate
        pageTransitionStart(done)
      else
        $('html, body').scrollTop 0
        done()

    update: ->
      $('header.site-header nav ul').css
        marginTop: (-36 * $('header.site-header nav ul li.menu-current').index()) + 'px'

      # newColor = @query('#color-styles').text().match(/color: (#[0-9a-f]{6}|[0-9a-f]{3})/i)
      # newColor = if newColor then newColor[1] else '#eeeeee'
      # $('.logo svg path').velocity { fill: newColor }, { duration: 1200 }

      $('#color-styles').text @query('#color-styles').text()
      $('.page-title').html @query('.page-title').html()
      $('.site-header').toggleClass 'dark', @query('.site-header').hasClass('dark')

      resHack = @data.replace /(html|head|body)/ig, 'my$1'
      myBody = $('<root>').html(resHack).find('mybody')
      $('body').attr 'class', ( if myBody.attr('class') then myBody.attr('class') else '' )

      $('a img').parent().addClass 'contains-image'
      $('#content').retina()
      $('a[rel=footnote]').footnotePopover()

    after: ->
      delay 20, => pageTransitionEnd() unless @popstate

    fail: ->
      pageTransitionEnd()
      alert "Can't load #{ @state.url }"

  # # Site Search
  # $(document).on 'submit', 'form.site-search', (e) ->
  #   e.preventDefault()
  #   window.location.href = "http://duckduckgo.com/?q=site%3Alekevicius.com+" + encodeURIComponent($('input[type=text]', @).val())


$(window).resize ->
  if isFullMenu and window.outerWidth < menuFullWidth
    isFullMenu = false
  if not isFullMenu and window.outerWidth >= menuFullWidth
    isFullMenu = true
    setNavigationPositions()
    delay 10, -> setNavigationPositions()
    delay 30, -> setNavigationPositions()

pageTransitionStart = (done) ->
  pageTransitionDone = done
  $('#color').css { height: window.outerHeight, top: $(window).scrollTop(), bottom: 'auto' }
  $('.page-title, #content').addClass 'faded'

pageTransitionEnd = ->
  pageTransitionDone = null
  $('html, body').scrollTop 0
  $('#color').css { height: 0, top: 'auto', bottom: $('.site-header').outerHeight() - window.outerHeight }
  $('.page-title, #content').removeClass 'faded'

setFutureCurrentMenuItem = (url) ->
  a = document.createElement('a')
  a.href = url
  futureNavigationItem = a.pathname.toLowerCase().split('/')[1]
  $('header.site-header nav ul li').removeClass 'menu-current'
  
  if [ 'journal', 'profile' ].indexOf(futureNavigationItem) > -1
    $("header.site-header nav ul li.menu-item-#{ futureNavigationItem }").addClass 'menu-current'
  else
    $('header.site-header nav ul li.menu-item-title').addClass 'menu-current'

setNavigationPositions = ->
  $('header.site-header nav ul').css
    marginTop: (-36 * $('header.site-header nav ul li.menu-current').index()) + 'px'

  allItems = [ 'menu-item-journal', 'menu-item-profile' ]
  activeItem = $('header.site-header nav ul li.menu-current:not(.menu-item-title)')
  runningTotalLeft = $('header.site-header nav ul li.menu-item-title').outerWidth() + 10

  if activeItem.length
    runningTotalLeft -= 26
    activeItemClass = _.without(activeItem.classList(), 'menu-current')[0]
    allItems = _.without allItems, activeItemClass if activeItemClass isnt 'menu-item-title'

    $("header.site-header nav ul li.#{ activeItemClass }").css 'left', runningTotalLeft
    runningTotalLeft += $("header.site-header nav ul li.#{ activeItemClass }").outerWidth() + 10

  for item in allItems
    $("header.site-header nav ul li.#{ item }").css 'left', runningTotalLeft
    runningTotalLeft += $("header.site-header nav ul li.#{ item }").outerWidth() + 10

  $('header.site-header nav ul').addClass 'positioned'
