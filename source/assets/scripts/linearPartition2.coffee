viewport_width = $(window).width()
ideal_height = parseInt($(window).height() / 2)
summed_width = photos.reduce ((sum, p) -> sum += p.get('aspect_ratio') * ideal_height), 0
rows = Math.round(summed_width / viewport_width)

if rows < 1
  # (2a) Fallback to just standard size
  photos.each (photo) -> photo.view.resize parseInt(ideal_height * photo.get('aspect_ratio')), ideal_height
else
  # (2b) Distribute photos over rows using the aspect ratio as weight
  weights = photos.map (p) -> parseInt(p.get('aspect_ratio') * 100)
  partition = linear_partition(weights, rows)

  # (3) Iterate through partition
  index = 0
  row_buffer = new Backbone.Collection
  _.each partition, (row) ->
    row_buffer.reset()
    _.each row, -> row_buffer.add(photos.at(index++))
    summed_ratios = row_buffer.reduce ((sum, p) -> sum += p.get('aspect_ratio')), 0
    row_buffer.each (photo) -> photo.view.resize parseInt(viewport_width / summed_ratios * photo.get('aspect_ratio')), parseInt(viewport_width / summed_ratios)
