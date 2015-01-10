$ ->
  if $('#maze').length

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
