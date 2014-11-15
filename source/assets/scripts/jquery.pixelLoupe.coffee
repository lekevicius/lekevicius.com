inBounds = (touch, element) ->
  elementPosition = $(element).offset()
  elementWidth = $(element).outerWidth()
  elementLeft = elementPosition.left
  elementRight = elementLeft + elementWidth
  elementHeight = $(element).outerHeight()
  elementTop = elementPosition.top
  elementBottom = elementTop + elementHeight
  touchX = touch.pageX
  touchY = touch.pageY
  (touchX > elementLeft && touchX < elementRight && touchY > elementTop && touchY < elementBottom)

$ ->
  native_width = 0
  native_height = 0
  isRetina = (window.devicePixelRatio > 1.3)
  retinaMultiplicator = if isRetina then 0.5 else 1
  last_image_url = ""

  $(document).on 'touchend touchleave mouseleave', '.screen-viewer img', (e) ->
    e.preventDefault() unless e.type is 'mouseleave'
    $('.loupe').removeClass 'visible'

  $(document).on 'touchstart touchmove touchenter mouseover mousemove', '.screen-viewer img', (e) ->
    e.preventDefault()
    e = e.originalEvent

    # console.log e.type
    if (e.type is 'touchstart' or e.type is 'mouseover' or e.type is 'touchenter')
      $('.loupe').addClass 'visible' unless $(".loupe").hasClass 'visible'

    eventTarget = e
    if e.type.indexOf('mouse') is -1
      eventTarget = e.touches[0] || e.changedTouches[0]
      $('.loupe').removeClass 'visible' if not inBounds(eventTarget, $(@))

    imageSrc = $(@).attr("src")
    loupeStyle = $(".loupe").css('background-image')
    loupeImageUrl = loupeStyle.substring(4, loupeStyle.length - 1)
    $(".loupe").css "background-image", "url('#{ imageSrc }')" if loupeImageUrl isnt imageSrc

    if imageSrc isnt last_image_url
      native_width = 0
      native_height = 0

    if !native_width && !native_height

      image_object = new Image()
      image_object.src = imageSrc
      last_image_url = imageSrc

      native_width = image_object.width
      native_height = image_object.height

      if isRetina
        $(".loupe").css "-webkit-background-size", "#{ native_width / 2 }px #{ native_height / 2 }px"
        $(".loupe").css "background-size", "#{ native_width / 2 }px #{ native_height / 2 }px"

    if native_width && native_height
      magnify_offset = $(this).offset()

      mx = eventTarget.pageX - magnify_offset.left
      my = eventTarget.pageY - magnify_offset.top

      rx = Math.round( mx / $(@).width() * native_width * retinaMultiplicator - $(".loupe").width() / 2 ) * -1
      ry = Math.round( my / $(@).height() *native_height * retinaMultiplicator - $(".loupe").height() / 2 ) * -1
      bgp = rx + "px " + ry + "px"

      touchOffset = if e.type.indexOf('mouse') is -1 then -120 else 0

      px = mx - $(".loupe").width() / 2
      py = my - $(".loupe").height() / 2

      $(".loupe").css({left: px + magnify_offset.left, top: py + magnify_offset.top + touchOffset, backgroundPosition: bgp})
