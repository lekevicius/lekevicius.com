window.Loop.LevelManager = class LevelManager

  constructor: (ready) ->
    @currentLevel = 0
    @hue = 0
    @levels = Loop.levels.levels

    if window.localStorage and localStorage["currentLevel"]
      @currentLevel = localStorage["currentLevel"]

  nextLevel: ->
    returnedBoard = {}
    @hue = Math.floor Math.random() * 360

    if @levels["#{ @currentLevel }"]
      levelData = @levels["#{ @currentLevel }"]
      @hue = levelData["hue"] if levelData["hue"]
      returnedBoard = new Loop.GameBoard levelData
    else
      newBoardWidth = Math.floor(Math.log(@currentLevel)/Math.log(2.16))
      newBoardHeight = Math.floor(Math.log(@currentLevel)/Math.log(1.58))
      # TODO adjust Log values to be more squarish MAYBE detect device, if desktop, just flip vertical for horizontal
      newBoardWidth += 1 if Math.random() > 0.5 
      newBoardHeight += 1 if Math.random() > 0.5
      newBoardWidth = Math.max(Math.min(newBoardWidth, 8), 3)
      newBoardHeight = Math.max(Math.min(newBoardHeight, 13), 3)
      newRandomChance = Math.random() * 0.3 + 0.3
      returnedBoard = new Loop.GameBoard newBoardWidth, newBoardHeight, newRandomChance

    localStorage["currentLevel"] = @currentLevel if window.localStorage

    @currentLevel++
    returnedBoard
