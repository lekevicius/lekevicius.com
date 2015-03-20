window.Loop.GameBoard = class GameBoard

  constructor: (@width, @height, @randomChance) ->
    @board = []
    if typeof @width is 'object'
      data = @width
      @width = data['width']
      @height = data['height']
      for column in [0...@width]
        @board.push []
        for row in [0...@height]
          cellInData = data["tiles"][row][column]
          @board[column].push new Loop.GameBoardCell(column, row, @, cellInData[0], cellInData[1], cellInData[2], cellInData[3], cellInData[4])
    else
      for column in [0...@width]
        @board.push []
        for row in [0...@height]
          @board[column].push new Loop.GameBoardCell(column, row, @)

      for column in [0...@width]
        for row in [0...@height]
          cell = @board[column][row]

          unless cell.topDefined
            topCell = @board[column][row - 1]
            outcome = @randomOutcome()
            cell.topOpen = topCell.bottomOpen = outcome
            cell.topDefined = topCell.bottomDefined = true

          unless cell.rightDefined
            rightCell = @board[column + 1][row]
            outcome = @randomOutcome()
            cell.rightOpen = rightCell.leftOpen = outcome
            cell.rightDefined = rightCell.leftDefined = true

          unless cell.bottomDefined
            bottomCell = @board[column][row + 1]
            outcome = @randomOutcome()
            cell.bottomOpen = bottomCell.topOpen = outcome
            cell.bottomDefined = bottomCell.topDefined = true

          unless cell.leftDefined
            leftCell = @board[column - 1][row]
            outcome = @randomOutcome()
            cell.leftOpen = leftCell.rightOpen = outcome
            cell.leftDefined = leftCell.rightDefined = true

  randomOutcome: -> (Math.random() > @randomChance)

  isWon: ->
    for column in [0...@width]
      for row in [0...@height]
        return false unless @board[column][row].isFullyConnected()
    return true
