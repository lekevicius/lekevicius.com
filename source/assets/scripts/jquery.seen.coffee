$ = jQuery

selectors = []
check_binded = false
check_lock = false

settings =
  interval: 250
  force_process: false
  debug: false

lastVisible = null

process = ->
  check_lock = false
  for selector in selectors
    appeared = $(selector).filter -> $(this).is ':appeared'
    appeared.each ->
      if $(@).attr('data-appearance-unseen') is 'unseen'
        $(@).attr 'data-appearance-unseen', 'seen'
        $(@).trigger 'seen'
    appeared.trigger 'appear', [ appeared ]

    if lastVisible
      disappeared = lastVisible.not appeared
      disappeared.trigger 'disappear', [ disappeared ]

    lastVisible = appeared

# "appeared" custom filter
$.expr[':']['appeared'] = (element) ->
  $element = $(element)
  return false unless $element.is(':visible')

  windowLeft = $(window).scrollLeft()
  windowTop = $(window).scrollTop()
  windowRight = windowLeft + $(window).width()
  windowBottom = windowTop + $(window).height()

  elementOffset = $element.offset()
  elementWidth = $element.width()
  elementHeight = $element.height()
  elementLeft = elementOffset.left
  elementTop = elementOffset.top
  elementRight = elementLeft + elementWidth
  elementBottom = elementTop + elementHeight

  appearOffsetTop  = $element.data('appearance-offset-top')  || 0
  appearOffsetLeft = $element.data('appearance-offset-left') || 0
  appearMinHeight  = $element.data('appearance-min-height')  || 0
  appearMinWidth   = $element.data('appearance-min-width')   || 0

  if appearOffsetTop isnt 0 or appearOffsetLeft isnt 0
    # if offset is set, base check on that
    if elementBottom >= windowTop &&
        elementTop - appearOffsetTop <= windowBottom &&
        elementRight >= windowLeft &&
        elementLeft - appearOffsetLeft <= windowRight
      return true

  # if appear percentage is set, base check on that
  else if appearMinHeight isnt 0
    appearMinHeight = 1.0 if appearMinHeight == 'all'
    appearMinHeight = parseFloat appearMinHeight
    visibleHeight = Math.max 0, windowBottom - elementTop
    visiblePercentage = (visibleHeight * 1.0) / (elementHeight * 1.0)
    return true if visiblePercentage >= appearMinHeight && elementBottom >= windowTop

  else if appearMinWidth isnt 0
    appearMinWidth = 1.0 if appearMinWidth == 'all'
    appearMinWidth = parseFloat appearMinHeight
    visibleWidth = Math.max 0, windowRight - elementLeft
    visiblePercentage = (elementWidth * 1.0) / (visibleWidth * 1.0)
    return true if visiblePercentage >= appearMinWidth && elementRight >= windowLeft

  else if elementBottom >= windowTop &&
      elementTop <= windowBottom &&
      elementRight >= windowLeft &&
      elementLeft <= windowRight
    return true

  else return false

$.fn.extend
  # watching for element's appearance in browser viewport
  trackAppearance: (options) ->
    settings = $.extend settings, options
    # return @each -> footnotePopover $(@)

    selector = this.selector || this

    unless check_binded
      check = ->
        return if check_lock
        check_lock = true
        setTimeout process, settings.interval

      $(window).on 'scroll resize', check
      check_binded = true

    setTimeout process, settings.interval if settings.force_process

    selectors.push selector

    $(selector).each ->
      $(@).attr 'data-appearance-unseen', 'unseen' if $(@).attr('data-appearance-unseen') is undefined

    return $(selector)

$.extend
  # force elements's appearance check
  checkAppearance: ->
    if check_binded
      process()
      return true
    # otherwise, there are no elements to check
    return false

$ -> $(window).scroll()
