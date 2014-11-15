$.fn.classList = () -> $(this).attr('class').split(/\s+/)
$.preload = (url, callback) -> $('<img/>').attr({ src: url }).load callback
delay = (time, func) -> setTimeout func, time



polarToCartesian = (centerX, centerY, radius, angleInDegrees) ->
  angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0
  return {
    x: centerX + ( radius * Math.cos(angleInRadians) )
    y: centerY + ( radius * Math.sin(angleInRadians) )
  }

describeArc = (x, y, radius, startAngle, endAngle) ->

  start = polarToCartesian x, y, radius, endAngle
  end = polarToCartesian x, y, radius, startAngle

  arcSweep = if endAngle - startAngle <= 180 then "0" else "1"

  return [ "M", start.x, start.y, "A", radius, radius, 0, arcSweep, 0, end.x, end.y ].join(" ")



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
  # Basic setup
  $('html').removeClass('no-js').addClass('js')
  $('#spacer, #color').css 'height', $('#container > header').outerHeight() + 'px'

  delay 50, -> $('#spacer, #color').css 'height', $('#container > header').outerHeight() + 'px'

  $('.menu-button').on 'click', (e) ->
    e.preventDefault()
    if $('#container > header .navigation-items').hasClass 'open'
      $('#container > header .navigation-items, .menu-button').removeClass 'open'
      $('#spacer, #color').animate { 'height': '-=150px' }, 300
    else
      $('#container > header .navigation-items, .menu-button').addClass 'open'
      $('#spacer, #color').animate { 'height': '+=150px' }, 300


  setNavigationPositions()
  $('#container > header nav ul').addClass 'manipulated'

  $('#page').retina()
  $('a.footnote').footnotePopover()
  $('.unseen').trackAppearance()
  $('.unseen').on 'seen', -> console.log @

  # Styling for iOS Homescreen app
  if (window.navigator.standalone) then $('#container > header .header-inner').attr('style', 'padding-top: 32px')

  # Pusher setup
  $('#color-cover').on 'webkitTransitionEnd transitionend msTransitionEnd oTransitionEnd', colorCoverTransitionEnd

  # $(document).on 'entree:before', (e, context) -> console.log context
  # $(document).on 'entree:update', (e, context) -> console.log context
  # $(document).on 'entree:after', (e, context) -> console.log context

  $(document).entree
    fragment: '#page'
    debug: true
    before: (done) ->
      a = document.createElement('a')
      a.href = @state.url

      activeNavigationItem = a.pathname.split('/')[1]
      $('#container > header .active').removeClass 'active'
      if activeNavigationItem isnt ''
        $("#container > header nav li.#{ activeNavigationItem }").addClass 'active'
        if $(window).width() <= 659
          $('.site-title').attr 'href', '/'
        else
          $('.site-title').attr 'href', '/' + activeNavigationItem
      else
        $("#container > header .site-title").addClass 'active'
        $('.site-title').attr 'href', '/'

      setNavigationPositions()

      $('#color-image').removeClass 'visible'

      unless @popstate
        pageTransitionStart(done)
      else
        $('html, body').animate({scrollTop: '0px'}, 0)
        done()
    update: ->
      $('#page').retina()

      colorStyle = @query('#color-styles').text()
      pageColor = '#' + colorStyle.match(/a { color: #([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3}); }/)[1]
      setColors pageColor

      $('#container > header .page-title').remove()
      pageTitle = @query('.page-title')
      pageTitle.addClass 'fade-in' unless @popstate
      $('#container > header').append pageTitle

      colorImage = @query('#color-image')
      if colorImage.attr('style')
        colorImageStyle = colorImage.css('background-image')
        colorImageUrl = colorImageStyle.substring(4, colorImageStyle.length - 1)
        $.preload colorImageUrl, ->
          $('#color-image').css('background-image', "url(#{ colorImageUrl })").addClass 'visible'

      resHack = @data.replace /(html|head|body)/ig, 'my$1'
      $('body').attr 'class', $('<root>').html(resHack).find('mybody').attr('class')

      headerHeight = $('#container > header').outerHeight()
      headerHeight -= 150 if $('#container > header .navigation-items').hasClass 'open'
      $('#spacer, #color').css 'height', headerHeight + 'px'

      $('a img').parent().addClass 'contains-image'
      $('a.footnote').footnotePopover()
    after: ->
      pageTransitionEnd() unless @popstate
    fail: ->
      pageTransitionEnd()
      alert "Can't load #{ @state.url }"

  # Site Search
  $(document).on 'submit', 'form.site-search', (e) ->
    e.preventDefault()
    window.location.href = "http://duckduckgo.com/?q=site%3Alekevicius.com+" + encodeURIComponent($('input[type=text]', @).val())

  if $('#maze').length
    width = 9
    height = 24
    seed = Math.round Math.random() * 1000000000

    directionShiftHorizontal =
      northWall: 0
      westWall: -1
      southWall: 0
      eastWall: 1

    directionShiftVertical =
      northWall: -1
      westWall: 0
      southWall: 1
      eastWall: 0

    directionOposite =
      northWall: 'southWall'
      westWall: 'eastWall'
      southWall: 'northWall'
      eastWall: 'westWall'

    class Cell
      constructor: (@x, @y) ->
        @northWall = true
        @westWall = true
        @southWall = true
        @eastWall = true
        @visited = false
     
    grid = ( ( new Cell(x, y) for x in [0...width] ) for y in [0...height] )
    
    count = 0
    carve_passages_from = (x, y, grid) ->
      directions = _.shuffle [ 'northWall', 'westWall', 'southWall', 'eastWall' ]
      for direction in directions
        neighboringCellX = x + directionShiftHorizontal[direction]
        neighboringCellY = y + directionShiftVertical[direction]
        neighboringCellY = 0 if neighboringCellY == height
        neighboringCellY = height - 1 if neighboringCellY == -1
        grid[ y ][ x ].visited = true

        if neighboringCellX < width and neighboringCellX >= 0 and neighboringCellY < height and neighboringCellY >= 0
          
          neighboringCell = grid[ neighboringCellY ][ neighboringCellX ]
          
          unless neighboringCell.visited
            grid[ y ][ x ][ direction ] = false
            grid[ neighboringCellY ][ neighboringCellX ][ directionOposite[direction] ] = false
            carve_passages_from neighboringCellX, neighboringCellY, grid

    carve_passages_from 0, 0, grid

    startY = 2
    endY = height / 2 + startY
    grid[startY][0].westWall = false
    grid[endY][width - 1].eastWall = false

    s = Snap '#maze'

    center = 400
    stepAngle = 360.0 / height
    stepRadius = 25
    for x in [0...width]
      radius = 70 + stepRadius * x
      for y in [0...height]
        cell = grid[y][x]
        startAngle = y * stepAngle
        endAngle = startAngle + stepAngle
        if cell.westWall
          path = s.path(describeArc(center, center, radius, startAngle, endAngle)).attr({ stroke: "#000", strokeWidth: 10, strokeLinecap: 'square' })

        if cell.northWall
          startPoint = polarToCartesian(center, center, radius, startAngle)
          endPoint = polarToCartesian(center, center, radius + stepRadius, startAngle)
          path = s.line(startPoint.x, startPoint.y, endPoint.x, endPoint.y).attr({ stroke: "#000", strokeWidth: 10, strokeLinecap: 'square' })

        if x == width - 1
          if cell.eastWall
            path = s.path(describeArc(center, center, radius + stepRadius, startAngle, endAngle)).attr({ stroke: "#000", strokeWidth: 10, strokeLinecap: 'square' })
