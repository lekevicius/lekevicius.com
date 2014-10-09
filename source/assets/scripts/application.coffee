$.fn.classList = () -> $(this).attr('class').split(/\s+/)

$.preload = (url, callback) -> $('<img/>').attr({ src: url }).load callback

delay = (time, func) -> setTimeout func, time

$(window).resize ->
  # resizeToCover()

$ ->
  console.log('')
