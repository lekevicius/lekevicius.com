window.Loop.Game = class Game

  constructor: ->
    @gameJustWon = false
    @gameReadyForNextLevel = false
    
    @tileSize = 48
    @gameBoard = {}
    @levelManager = new Loop.LevelManager
    
    @gameBackgroundColor = "#000"
    @gameOutlineColor = "#000"
    @gameInsideColor = "#000"
    @gameWonBackgroundColor = "#fafafa"
    @gameWonOutlineColor = "#000"
    @gameWonInsideColor = "#000"

    # TODO google analytics tracking
    # TODO Sounds and background music
    @newGame()

  delay: (time, func) -> setTimeout func, time

  newGame: ->
    @gameBoard = @levelManager.nextLevel()
    @tileSize = @calculateTileSize()
    $('.game').css
      width: @gameBoard.width * @tileSize
      height: @gameBoard.height * @tileSize
      marginLeft: (@gameBoard.width * @tileSize) / (-2)
      marginTop: (@gameBoard.height * @tileSize) / (-2)
    @generateColors()

    # TODO play new level sound
    $('body').addClass('slow-transition').css { backgroundColor: @gameBackgroundColor }
    @delay 1000, -> $('body').removeClass 'slow-transition'
    
    # TODO restore volume

    for row in [0...@gameBoard.height]
      for column in [0...@gameBoard.width]
        @createTile @gameBoard.board[column][row], @gameOutlineColor, @gameInsideColor, 'tile'
    $('.tile').on 'click', $.proxy(@onTileClick, @)

    center = { x: (@gameBoard.width * @tileSize / 2), y: (@gameBoard.height * @tileSize / 2) }
    $tiles = $('.tile').toArray()
    for tile in $tiles
      $tile = $(tile)
      tileCenter = { x: ($tile.data('x') * @tileSize + (@tileSize / 2)), y: ($tile.data('y') * @tileSize + (@tileSize / 2)) }
      distance = Math.floor(@distance(center, tileCenter))
      $tile.transition
        opacity: 1
        duration: 300
        delay: (900 + distance * 2)

  calculateTileSize: ->
    padding = 15
    maximumSize = 72
    screenWidth = $(window).width()
    screenHeight = $(window).height()
    maximumSize = 48 if screenWidth < 500

    maxWidth = (screenWidth - 2 * padding) / @gameBoard.width
    maxHeight = (screenHeight - 2 * padding) / @gameBoard.height
    moreLimitingSize = Math.min maxWidth, maxHeight

    if moreLimitingSize >= maximumSize
      return maximumSize
    else
      return Math.floor( moreLimitingSize / 2 ) * 2

  hsbToHsl: (h, s, b) ->
    l = 0.5 * b * (2 - s)
    "hsl(#{ h },#{ Math.round((b * s / (1 - Math.abs(2 * l - 1))) * 100) }%,#{ Math.round(l * 100) }%)"

  generateColors: ->
    hue = @levelManager.hue
    @gameBackgroundColor = @hsbToHsl(hue, 0.1, 0.91)
    @gameOutlineColor = @hsbToHsl(hue, 0.1, 0.91)
    @gameInsideColor = @hsbToHsl(hue, 0.42, 0.58)
    @gameWonBackgroundColor = @hsbToHsl(hue, 0.92, 0.20)
    @gameWonOutlineColor = @hsbToHsl(hue, 0.85, 0.97)
    @gameWonInsideColor = @hsbToHsl(hue, 0.92, 0.20)

  createTile: (cell, outlineColor, insideColor, tileClass) ->
    $tileCanvas = $(@drawTile(cell.topOpen, cell.rightOpen, cell.bottomOpen, cell.leftOpen, outlineColor, insideColor))
    $tileCanvas.css
      left: @tileSize * cell.xPosition
      top: @tileSize * cell.yPosition
      transform: "rotate(#{cell.rotation * 90}deg)"
      opacity: 0
    $tileCanvas.data
      x: cell.xPosition
      y: cell.yPosition
    $tileCanvas.attr 'class', tileClass
    $('.game').append $tileCanvas

  lerp: (a, b, fraction) -> (b - a) * fraction + a

  distance: (from, to) -> Math.sqrt(Math.pow((to.x - from.x), 2) + Math.pow((to.y - from.y), 2))

  drawTile: (top, right, bottom, left, outlineColor, insideColor) ->
    size = @tileSize

    canvas = document.createElement 'canvas'
    canvas.width = size
    canvas.height = size
    context = canvas.getContext '2d'

    edgeCount = 0
    edgeCount++ if top
    edgeCount++ if right
    edgeCount++ if bottom
    edgeCount++ if left

    outlineWidth = size * 0.2
    insideWidth = size * 0.125

    setTopLeftCornerPath = () => context.beginPath(); context.arc(0, 0, size/2, 0, Math.PI/2);
    setTopRightCornerPath = () => context.beginPath(); context.arc(size, 0, size/2, Math.PI/2, Math.PI);
    setBottomRightCornerPath = () => context.beginPath(); context.arc(size, size, size/2, Math.PI, Math.PI*1.5);
    setBottomLeftCornerPath = () => context.beginPath(); context.arc(0, size, size/2, Math.PI*1.5, Math.PI*2);

    if edgeCount is 1
      if top
        setConnectionPath = () => context.beginPath(); context.moveTo(size/2, 0); context.lineTo(size/2, size/4);
      else if right
        setConnectionPath = () => context.beginPath(); context.moveTo(size, size/2); context.lineTo(size-size/4, size/2);
      else if bottom
        setConnectionPath = () => context.beginPath(); context.moveTo(size/2, size); context.lineTo(size/2, size-size/4);
      else if left
        setConnectionPath = () => context.beginPath(); context.moveTo(0, size/2); context.lineTo(size/4, size-size/2);

      setConnectionPath()
      context.lineWidth = outlineWidth
      context.strokeStyle = outlineColor
      context.stroke()

      context.lineWidth = outlineWidth
      context.strokeStyle = outlineColor
      context.beginPath()
      context.arc(size/2, size/2, size/4, 0, 2*Math.PI)
      context.stroke()

      context.lineWidth = insideWidth
      context.strokeStyle = insideColor
      context.beginPath()
      context.arc(size/2, size/2, size/4, 0, 2*Math.PI)
      context.stroke()

      setConnectionPath()
      context.lineWidth = insideWidth
      context.strokeStyle = insideColor
      context.stroke()

    else if edgeCount is 2
      if (top and bottom) or (left and right)
        if top and bottom
          setLinePath = () => context.beginPath(); context.moveTo(size/2, 0); context.lineTo(size/2, size);
        else
          setLinePath = () => context.beginPath(); context.moveTo(0, size/2); context.lineTo(size, size/2);

        context.lineWidth = outlineWidth
        context.strokeStyle = outlineColor
        setLinePath()
        context.stroke()

        context.lineWidth = insideWidth
        context.strokeStyle = insideColor
        setLinePath()
        context.stroke()
      else

        if top and left
          cornerFunction = setTopLeftCornerPath
        else if top and right
          cornerFunction = setTopRightCornerPath
        else if bottom and right
          cornerFunction = setBottomRightCornerPath
        else if bottom and left
          cornerFunction = setBottomLeftCornerPath

        context.lineWidth = outlineWidth
        context.strokeStyle = outlineColor
        cornerFunction()
        context.stroke()

        context.lineWidth = insideWidth
        context.strokeStyle = insideColor
        cornerFunction()
        context.stroke()
        
    else if edgeCount is 3
      if not top
        firstPath = setBottomRightCornerPath
        secondPath = setBottomLeftCornerPath
      else if not right
        firstPath = setBottomLeftCornerPath
        secondPath = setTopLeftCornerPath
      else if not bottom
        firstPath = setTopLeftCornerPath
        secondPath = setTopRightCornerPath
      else if not left
        firstPath = setTopRightCornerPath
        secondPath = setBottomRightCornerPath
      
      context.lineWidth = outlineWidth
      context.strokeStyle = outlineColor
      firstPath()
      context.stroke()

      context.lineWidth = insideWidth
      context.strokeStyle = insideColor
      firstPath()
      context.stroke()

      context.lineWidth = outlineWidth
      context.strokeStyle = outlineColor
      secondPath()
      context.stroke()

      context.lineWidth = insideWidth
      context.strokeStyle = insideColor
      secondPath()
      context.stroke()

    else if edgeCount is 4
      context.lineWidth = outlineWidth
      context.strokeStyle = outlineColor
      setTopRightCornerPath()
      context.stroke()
      context.lineWidth = insideWidth
      context.strokeStyle = insideColor
      setTopRightCornerPath()
      context.stroke()

      context.lineWidth = outlineWidth
      context.strokeStyle = outlineColor
      setBottomRightCornerPath()
      context.stroke()
      context.lineWidth = insideWidth
      context.strokeStyle = insideColor
      setBottomRightCornerPath()
      context.stroke()

      context.lineWidth = outlineWidth
      context.strokeStyle = outlineColor
      setBottomLeftCornerPath()
      context.stroke()
      context.lineWidth = insideWidth
      context.strokeStyle = insideColor
      setBottomLeftCornerPath()
      context.stroke()

      context.lineWidth = outlineWidth
      context.strokeStyle = outlineColor
      setTopLeftCornerPath()
      context.stroke()
      context.lineWidth = insideWidth
      context.strokeStyle = insideColor
      setTopLeftCornerPath()
      context.stroke()

      context.save()

      context.beginPath()
      context.rect(size/4, 0, size/2, size*0.375)
      context.clip()

      context.lineWidth = outlineWidth
      context.strokeStyle = outlineColor
      setTopRightCornerPath()
      context.stroke()
      context.lineWidth = insideWidth
      context.strokeStyle = insideColor
      setTopRightCornerPath()
      context.stroke()

      context.restore()

    return canvas

  onTileClick: (e) ->
    if @gameJustWon
      if @gameReadyForNextLevel
        @gameJustWon = @gameReadyForNextLevel = false
        $('body').off 'click'
        $('.tile-won').transition
          opacity: 0
          duration: 300
          complete: -> $(@).remove()
        @delay 330, $.proxy(@newGame, @)
    else
      $target = $(e.currentTarget)
      cell = @gameBoard.board[ $target.data('x') ][ $target.data('y') ]
      return unless cell.topOpen or cell.rightOpen or cell.bottomOpen or cell.leftOpen
      cell.rotation += 1

      # TODO play random turn sound
      $target.transition
        rotate: "#{ cell.rotation * 90 }deg"
        duration: 150
        complete: =>
          if @gameBoard.isWon()
            @gameJustWon = true
            #TODO play shift sound
            #TODO send game_action / level_completed / completed / @levelManager.currentLevel
            #TODO silent background music to 0.5
            for row in [0...@gameBoard.height]
              for column in [0...@gameBoard.width]
                @createTile @gameBoard.board[column][row], @gameWonOutlineColor, @gameWonInsideColor, 'tile-won'
            $('.tile-won').on 'click', $.proxy(@onTileClick, @)
            $('body').on 'click', $.proxy(@onTileClick, @)

            $('.tile').transition
              opacity: 0
              duration: 300
              complete: ->
                $(@).remove()
            $('.tile-won').transition
              opacity: 1
              duration: 300
              complete: =>
                @gameReadyForNextLevel = true
            $('body').css
              backgroundColor: @gameWonBackgroundColor
