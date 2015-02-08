$ = jQuery

log = (msg) -> console?.log msg if settings.debug
delay = (time, func) -> setTimeout func, time

settings =
  debug: false
  margin: 10

mouseoverTimeout = false
isTouch = if Modernizr then Modernizr.touch else (typeof TouchEvent != "undefined")

onFootnoteOver = ->
  clearTimeout mouseoverTimeout
  $('#footnote-popover').remove()

  linkId = $(this).get(0).hash.substring(1)
  if $( "[id='#{ linkId }']" ).length
    footnoteContent = $( "[id='#{ linkId }']" ).html()

    div = $("<div id='footnote-popover'>")
    div.html footnoteContent

    if isTouch
      closeLink = $('<a href ="#" class="close">&times;</a>')
      closeLink.click ->
        $('#footnote-popover').remove()
        false
    div.prepend closeLink

    div.css
      maxWidth:  Math.min($(window).width()  - settings.margin * 2, 500) + 'px'
      maxHeight: Math.min($(window).height() - settings.margin * 2, 400) + 'px'

    div.on 'mouseover', onFootnotePopoverOver
    div.on 'mouseout', onFootnoteOut

    $(document.body).append(div)

    position = $(this).offset()
    actualWidth = div.width()

    left = position.left
    # $(window).width() + $(window).scrollLeft() is a coordinate for right of the window
    # If popover would go out of that bound...
    if left + settings.margin + actualWidth > $(window).width() + $(window).scrollLeft()
      if settings.margin * 2 + actualWidth > $(window).width()
        # if can't fit, center
        left = ($(window).width() - actualWidth - settings.margin * 2) / 2.0 - settings.margin
      else
        # if can fit, show to the left
        left -= actualWidth + settings.margin * 2
        # if pushed too far, move back right
        left = settings.margin if left < settings.margin


    top = position.top + settings.margin * 2
    # $(window).height() + $(window).scrollTop() is a coordinate for bottom of the window
    # If popover would go out of that bound, show it above instead of below.
    if top + div.height() > $(window).height() + $(window).scrollTop()
      top = position.top - div.height() - settings.margin * 2

    div.css
      left: left
      top: top

onFootnoteOut = -> mouseoverTimeout = delay 200, -> $('#footnote-popover').remove()

onFootnotePopoverOver = -> clearTimeout mouseoverTimeout

footnotePopover = (el) ->
  el.off 'mouseover', onFootnoteOver
  el.off 'mouseout', onFootnoteOut
  el.on 'mouseover', onFootnoteOver
  el.on 'mouseout', onFootnoteOut

$.fn.extend
  footnotePopover: (options) ->
    settings = $.extend settings, options
    return @each -> footnotePopover $(@)
