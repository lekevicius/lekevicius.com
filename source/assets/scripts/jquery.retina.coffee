$ = jQuery

retinaImages = []
confirmedPaths = []
retinaRatio = 1.3

# I slightly disregard the jQuery docs advice and
# add two new functions to jQuery in the same file.
# $.fn.isRetina is a little helper to detect high res screens.
$.isRetina = ->
  # 1.3 is pixel ratio of Nexus 7 - it benefits from retina resolution
  mediaQuery = "(-webkit-min-device-pixel-ratio: #{ retinaRatio }), (min--moz-device-pixel-ratio: #{ retinaRatio }), (-o-min-device-pixel-ratio: #{ retinaRatio * 2 }/2), (min-resolution: #{ retinaRatio }dppx)"
  return true if window.devicePixelRatio > 1
  return true if window.matchMedia and window.matchMedia(mediaQuery).matches
  return false

imgNativeSize = (src, callback) ->
    tempImg = new Image()
    tempImg.onload = ->
      height = tempImg.height
      width = tempImg.width
      callback width, height
    tempImg.src = src

# We don't attempt to load retina versions of external images.
# In the future, if most websites adapt @2x notation, maybe it will make sense to check everything.
isExternalImage = (path) -> !!( path.match(/^https?\:/i) and !path.match('//' + document.domain) )

# Simple function object to hold basic data for paths.
RetinaImagePath = (path) ->
  @path = path
  @retinaPath = path.replace /\.\w+$/, (match) -> "@2x" + match
  @isExternal = isExternalImage path

checkRetinaVariant = (path, callback) ->
  if path.isExternal
    return callback false
  # If we have already checked this path and confirmed it, return
  else if path.retinaPath in confirmedPaths
    return callback true
  else
    $.ajax
      type: "HEAD"
      url: path.retinaPath
      success: (data, status, response) ->
        # Check mime-type
        type = response.getResponseHeader 'Content-Type'
        return callback false if type == null or !type.match /^image/i
        # All seems fine, confirm path and return
        confirmedPaths.push path.retinaPath
        return callback true
      error: (data) ->
        return callback false

RetinaImage = (el) ->
  path = new RetinaImagePath(el.getAttribute('src'))
  checkRetinaVariant path, (hasVariant) ->
    swapRetinaImage el, path if hasVariant

swapRetinaImage = (element, path) ->
  load = ->
    if ! element.complete
      setTimeout load, 5
    else
      # alert element.offsetWidth
      imgNativeSize path.path, (nativeWidth, nativeHeight) ->
        if (nativeWidth / element.offsetWidth) < retinaRatio
          element.setAttribute 'width', nativeWidth
          element.setAttribute 'height', nativeHeight
          element.setAttribute 'src', path.retinaPath
  load()

$.fn.extend
  retina: ->
    return @each ->
      if $.isRetina()
        $("img[src$='.jpg'], img[src$='.jpeg'], img[src$='.png'], img[src$='.gif']", @).each ->
          retinaImages.push new RetinaImage(@)
