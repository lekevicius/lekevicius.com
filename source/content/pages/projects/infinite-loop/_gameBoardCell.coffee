window.Loop.GameBoardCell = class GameBoardCell

  constructor: (@xPosition, @yPosition, @gameBoard, top=undefined, right=undefined, bottom=undefined, left=undefined, rotation=undefined) ->

    @topOpen = false
    @rightOpen = false
    @bottomOpen = false
    @leftOpen = false
      
    @topDefined = false
    @rightDefined = false
    @bottomDefined = false
    @leftDefined = false
      
    @rotation = 0

    if top isnt undefined
      @topOpen = top
      @rightOpen = right
      @bottomOpen = bottom
      @leftOpen = left
      @rotation = rotation
      @topDefined = @rightDefined = @bottomDefined = @leftDefined = true
    else
      [@topOpen, @topDefined] = [false, true] if @yPosition is 0
      [@rightOpen, @rightDefined] = [false, true] if @xPosition is (@gameBoard.width - 1)
      [@bottomOpen, @bottomDefined] = [false, true] if @yPosition is (@gameBoard.height - 1)
      [@leftOpen, @leftDefined] = [false, true] if @xPosition is 0

      @rotation = Math.floor Math.random() * 4

  sideVisiblyOpen: (side) ->
    r = @rotation % 4
    if side is 'top'
      return @topOpen if r is 0
      return @leftOpen if r is 1
      return @bottomOpen if r is 2
      return @rightOpen if r is 3
    if side is 'right'
      return @rightOpen if r is 0
      return @topOpen if r is 1
      return @leftOpen if r is 2
      return @bottomOpen if r is 3
    if side is 'bottom'
      return @bottomOpen if r is 0
      return @rightOpen if r is 1
      return @topOpen if r is 2
      return @leftOpen if r is 3
    if side is 'left'
      return @leftOpen if r is 0
      return @bottomOpen if r is 1
      return @rightOpen if r is 2
      return @topOpen if r is 3

  isFullyConnected: ->
    # console.log "Tile at #{@xPosition} #{@yPosition}, rotation #{ @rotation % 4 }, open sides #{ +(@topOpen) }#{ +(@rightOpen) }#{ +(@bottomOpen) }#{ +(@leftOpen) }, visible sides #{ +(@sideVisiblyOpen('top')) }#{ +(@sideVisiblyOpen('right')) }#{ +(@sideVisiblyOpen('bottom')) }#{ +(@sideVisiblyOpen('left')) }"
    if @yPosition > 0
      topCell = @gameBoard.board[@xPosition][@yPosition - 1]
      return false if @sideVisiblyOpen("top") isnt topCell.sideVisiblyOpen("bottom")
    else
      return false if @sideVisiblyOpen("top")

    if @xPosition < @gameBoard.width - 1
      rightCell = @gameBoard.board[@xPosition + 1][@yPosition]
      return false if @sideVisiblyOpen("right") isnt rightCell.sideVisiblyOpen("left")
    else
      return false if @sideVisiblyOpen("right")

    if @yPosition < @gameBoard.height - 1
      bottomCell = @gameBoard.board[@xPosition][@yPosition + 1]
      return false if @sideVisiblyOpen("bottom") isnt bottomCell.sideVisiblyOpen("top")
    else
      return false if @sideVisiblyOpen("bottom")

    if @xPosition > 0
      leftCell = @gameBoard.board[@xPosition - 1][@yPosition]
      return false if @sideVisiblyOpen("left") isnt leftCell.sideVisiblyOpen("right")
    else
      return false if @sideVisiblyOpen("left")

    return true
