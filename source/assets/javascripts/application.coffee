$.fn.classList = () -> $(this).attr('class').split(/\s+/)
$.preload = (url, callback) -> $('<img/>').attr({ src: url }).load callback
delay = (time, func) -> setTimeout func, time
controller = null

min_w = 300
vid_w_orig = null
vid_h_orig = null

$(window).resize -> resizeToCover()

$ ->
  vid_w_orig = parseInt $('video').attr('width')
  vid_h_orig = parseInt $('video').attr('height')
  resizeToCover()

resizeToCover = ->
  console.log "Boom"
  $('.video-viewport').width $(window).width()
  $('.video-viewport').height $(window).height()

  scale_h = $(window).width() / vid_w_orig
  scale_v = $(window).height() / vid_h_orig
  scale = scale_h > scale_v ? scale_h : scale_v

  if scale * vid_w_orig < min_w then scale = min_w / vid_w_orig

  $('video').width scale * vid_w_orig
  $('video').height scale * vid_h_orig
  $('.video-viewport').scrollLeft $('video').width() - $(window).width() / 2
  $('.video-viewport').scrollTop $('video').height() - $(window).height() / 2
