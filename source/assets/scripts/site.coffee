$.fn.classList = () -> $(this).attr('class').split(/\s+/)
$.preload = (url, callback) -> $('<img/>').attr({ src: url }).load callback
delay = (time, func) -> setTimeout func, time





setColors = (toColor) ->
  $('#color, #color-cover').css 'background-color', toColor
  $('#color-styles').text """a { color: #{ toColor }; }
    .color-background { background-color: #{ toColor } !important; }
    .color-border { border-color: #{ toColor } !important; }"""

$(window).resize ->
  $('#spacer, #color').css 'height', $('#container > header').outerHeight() + 'px'

pageTransitionDone = null
colorCoverTransitionEnd = (event) -> pageTransitionDone() if pageTransitionDone isnt null

pageTransitionStart = (done) ->
  pageTransitionDone = done
  $('#color-cover').css 'height', '100%'
  $('html, body').animate({scrollTop: '0px'}, 500)
  $('.page-title').addClass 'fade-out'

pageTransitionEnd = ->
  pageTransitionDone = null
  $('#color-cover').css 'height', '0'
  $('#container > header .page-title').removeClass 'fade-in'
  $('.navigation-items, .menu-button').removeClass 'open'

setNavigationPositions = ->
  allItems = ['journal', 'projects', 'portfolio', 'profile']
  activeItem = $('#container > header nav li.active')
  runningTotalLeft = 0
  if activeItem.length
    activeItemClasses = activeItem.classList()
    activeItemClasses.splice( $.inArray('active', activeItemClasses), 1 )
    activeItemClass = activeItemClasses[0]

    allItems.splice( $.inArray(activeItemClass, allItems), 1 )
    runningTotalLeft = 6

    $('#container > header nav li.active').css 'left', runningTotalLeft
    runningTotalLeft += $('#container > header nav li.active').outerWidth()

  for item in allItems
    runningTotalLeft += 24
    $("#container > header nav li.#{ item }").css 'left', runningTotalLeft
    runningTotalLeft += $("#container > header nav li.#{ item }").outerWidth()


$ ->
  $('.menu-button').on 'click', -> $(@).toggleClass 'active'
  # Basic setup
  # $('html').removeClass('no-js').addClass('js')
  # $('#spacer, #color').css 'height', $('#container > header').outerHeight() + 'px'

  # delay 50, -> $('#spacer, #color').css 'height', $('#container > header').outerHeight() + 'px'

  # $('.menu-button').on 'click', (e) ->
  #   e.preventDefault()
  #   if $('#container > header .navigation-items').hasClass 'open'
  #     $('#container > header .navigation-items, .menu-button').removeClass 'open'
  #     $('#spacer, #color').animate { 'height': '-=150px' }, 300
  #   else
  #     $('#container > header .navigation-items, .menu-button').addClass 'open'
  #     $('#spacer, #color').animate { 'height': '+=150px' }, 300


  # setNavigationPositions()
  # $('#container > header nav ul').addClass 'manipulated'

  # $('#page').retina()
  # $('a.footnote').footnotePopover()
  # $('.unseen').trackAppearance()
  # $('.unseen').on 'seen', -> console.log @

  # # Styling for iOS Homescreen app
  # if (window.navigator.standalone) then $('#container > header .header-inner').attr('style', 'padding-top: 32px')

  # # Pusher setup
  # $('#color-cover').on 'webkitTransitionEnd transitionend msTransitionEnd oTransitionEnd', colorCoverTransitionEnd

  # # $(document).on 'entree:before', (e, context) -> console.log context
  # # $(document).on 'entree:update', (e, context) -> console.log context
  # # $(document).on 'entree:after', (e, context) -> console.log context

  # $(document).entree
  #   fragment: '#page'
  #   debug: true
  #   before: (done) ->
  #     a = document.createElement('a')
  #     a.href = @state.url

  #     activeNavigationItem = a.pathname.split('/')[1]
  #     $('#container > header .active').removeClass 'active'
  #     if activeNavigationItem isnt ''
  #       $("#container > header nav li.#{ activeNavigationItem }").addClass 'active'
  #       if $(window).width() <= 659
  #         $('.site-title').attr 'href', '/'
  #       else
  #         $('.site-title').attr 'href', '/' + activeNavigationItem
  #     else
  #       $("#container > header .site-title").addClass 'active'
  #       $('.site-title').attr 'href', '/'

  #     setNavigationPositions()

  #     $('#color-image').removeClass 'visible'

  #     unless @popstate
  #       pageTransitionStart(done)
  #     else
  #       $('html, body').animate({scrollTop: '0px'}, 0)
  #       done()
  #   update: ->
  #     $('#page').retina()

  #     colorStyle = @query('#color-styles').text()
  #     pageColor = '#' + colorStyle.match(/a { color: #([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3}); }/)[1]
  #     setColors pageColor

  #     $('#container > header .page-title').remove()
  #     pageTitle = @query('.page-title')
  #     pageTitle.addClass 'fade-in' unless @popstate
  #     $('#container > header').append pageTitle

  #     colorImage = @query('#color-image')
  #     if colorImage.attr('style')
  #       colorImageStyle = colorImage.css('background-image')
  #       colorImageUrl = colorImageStyle.substring(4, colorImageStyle.length - 1)
  #       $.preload colorImageUrl, ->
  #         $('#color-image').css('background-image', "url(#{ colorImageUrl })").addClass 'visible'

  #     resHack = @data.replace /(html|head|body)/ig, 'my$1'
  #     $('body').attr 'class', $('<root>').html(resHack).find('mybody').attr('class')

  #     headerHeight = $('#container > header').outerHeight()
  #     headerHeight -= 150 if $('#container > header .navigation-items').hasClass 'open'
  #     $('#spacer, #color').css 'height', headerHeight + 'px'

  #     $('a img').parent().addClass 'contains-image'
  #     $('a.footnote').footnotePopover()
  #   after: ->
  #     pageTransitionEnd() unless @popstate
  #   fail: ->
  #     pageTransitionEnd()
  #     alert "Can't load #{ @state.url }"

  # # Site Search
  # $(document).on 'submit', 'form.site-search', (e) ->
  #   e.preventDefault()
  #   window.location.href = "http://duckduckgo.com/?q=site%3Alekevicius.com+" + encodeURIComponent($('input[type=text]', @).val())

