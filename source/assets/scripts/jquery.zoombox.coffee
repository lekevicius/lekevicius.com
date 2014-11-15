delay = (time, func) -> setTimeout func, time

margin = 15
originalElement = null
hiding = false
currentZoomboxImage = null
fullWidth = null
fullHeight = null

loadImage = (src, callback) ->
  tempImg = new Image()
  tempImg.onload = ->
    height = tempImg.height
    width = tempImg.width
    callback width, height
  tempImg.src = src

cancelZoombox = ->
  $('#zoombox-background').html('').removeClass('shown').off 'click', cancelZoombox
  hiding = 'cancel'
  originalElement.css
    visibility: 'inherit'

closeZoombox = ->
  $('#zoombox-background').removeClass('shown').off 'click', closeZoombox
  $(window).off 'scroll resize', repositionImages
  hiding = 'close'

  originalElementTop = originalElement.offset().top
  originalElementLeft = originalElement.offset().left
  originalElementWidth = originalElement.outerWidth()
  originalElementHeight = originalElement.outerHeight()

  currentZoomboxImage.css
    top: originalElementTop
    left: originalElementLeft
    width: originalElementWidth
    height: originalElementHeight


repositionImages = (doTransition = false) ->
  displayAreaWidth = $(window).width() - margin * 2
  displayAreaHeight = $(window).height() - margin * 2

  fullImageProportion = fullWidth / fullHeight
  displayAreaProportion = displayAreaWidth / displayAreaHeight

  if fullWidth <= displayAreaWidth and fullHeight <= displayAreaHeight
    zoomedElementWidth = fullWidth
    zoomedElementHeight = fullHeight
  else
    if fullImageProportion >= displayAreaProportion
      zoomedElementWidth = displayAreaWidth
      zoomedElementHeight = displayAreaWidth / fullImageProportion
    else
      zoomedElementHeight = displayAreaHeight
      zoomedElementWidth = displayAreaHeight * fullImageProportion

  zoomedElementTop = (displayAreaHeight - zoomedElementHeight) / 2 + margin + $(window).scrollTop()
  zoomedElementLeft = (displayAreaWidth - zoomedElementWidth) / 2 + margin +  $(window).scrollLeft()

  currentZoomboxImage.addClass('no-transition') unless doTransition is true
  currentZoomboxImage.css
    top: zoomedElementTop
    left: zoomedElementLeft
    width: zoomedElementWidth
    height: zoomedElementHeight
  delay 1, -> currentZoomboxImage.removeClass('no-transition') unless doTransition is true

zoomboxTransitionEnd = ->
  if hiding
    if hiding == 'close'
      $('#zoombox-background').html('')
      originalElement.css
        visibility: 'inherit'
    $('#zoombox-background').hide()
    hiding = false

$ ->
  $('body').append $('<div id="zoombox-background">')

  $('#zoombox-background').on 'webkitTransitionEnd transitionend msTransitionEnd oTransitionEnd', zoomboxTransitionEnd

  $(document).on 'click', '.zoombox a[href$="png"], .zoombox a[href$="jpg"], .zoombox a[href$="gif"]', ->

    $('#zoombox-background').on 'click', cancelZoombox
    originalElement = $('img', @).first()

    currentZoomboxImage = $('<div class="zoombox-image loading">')
    currentZoomboxImage.html("<img class='original' src='#{ originalElement.attr('src') }'><div class='spinner-holder'><div class='spinner'></div></div>")


    originalElementTop = originalElement.offset().top
    originalElementLeft = originalElement.offset().left
    originalElementWidth = originalElement.outerWidth()
    originalElementHeight = originalElement.outerHeight()

    fullWidth = null
    fullHeight = null

    currentZoomboxImage.css
      top: originalElementTop
      left: originalElementLeft
      width: originalElementWidth
      height: originalElementHeight

    $('#zoombox-background').append(currentZoomboxImage).css( 'height', $(document).height() )
    $('#zoombox-background').show()
    delay 1, ->
      $('#zoombox-background').addClass('shown')
      originalElement.css
        visibility: 'hidden'

    ##### Load image

    imageLink = $(@).attr('href')

    loadImage imageLink, (width, height) ->
      fullWidth = width
      fullHeight = height

      $('#zoombox-background').off 'click', cancelZoombox
      $('#zoombox-background').on 'click', closeZoombox
      $('.spinner-holder', currentZoomboxImage).addClass 'hidden'
      $('img.original', currentZoomboxImage).after $("<img class='full' src='#{ imageLink }'>")
      currentZoomboxImage.removeClass('loading').addClass('zoomed')

      repositionImages(true)
      $(window).on 'scroll resize', repositionImages

    return false
