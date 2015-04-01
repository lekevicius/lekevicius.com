$ = jQuery

settings =
  query: "a:not([href^='http'],[href$='.gif'],[href$='.png'],[href$='.jpg'],[href$='.xml'],[href$='.zip'],[href$='.tar'])"
  fragment: 'body'
  debug: false
  before: (done) -> done()
  update: ->
  after: ->
  fail: -> alert "Failed to load #{ this.state.url }"
  onStateCreation: (state, elem) ->

currentState = null

initialPop = true
initialURL = window.location.href

entree = (el) ->

  return unless window.history.pushState # Check for pushState support

  initialState = window.history.state
  if initialState and initialState.time then currentState = initialState
  unless currentState
    currentState =
      time: stateTime()
      url: window.location.href
      title: document.title
    window.history.replaceState currentState, document.title, window.location.href

  # Non-webkit browsers don't fire an initial popstate event
  if window.history.state? then initialPop = false
  $(window).on 'popstate', (e) -> popState e.state  # popstate event

  # click event
  $(el).on 'click', settings.query, (e) ->
    link = e.currentTarget

    return if e.which > 1 or e.metaKey or e.ctrlKey or e.shiftKey or e.altKey
    return if  window.location.protocol isnt link.protocol or window.location.hostname isnt link.hostname
    return if link.hash and link.href.replace(link.hash, '') is window.location.href.replace(window.location.hash, '')
    return if link.href is location.href + '#'

    e.preventDefault()

    state =
      time: stateTime()
      url: $(this)[0].href

    pushState state



pushState = (state, popstate = false) ->
  return unless state
  return if currentState.url is state.url and not popstate

  context =
    popstate: popstate
    state: state
    url: state.url

  done = ->
    $.ajax
      type: 'GET',
      url: state.url

    .done (data) ->
      context.data = data
      context.query = (query) ->
        data = context?.data || this.data || ''
        $("<root>").html(data).find(query)

      parsedData = parseData data
      $.extend context, parsedData # title, contents, body, head


      # TODO var diff = $(old_array).not(new_array).get();

      currentScripts = $.map $('script[src]:not([src^=http],[src^="//"])'), (el) -> $(el).attr('src')
      newScripts = $.map context.query('script[src]:not([src^=http],[src^="//"])'), (el) -> $(el).attr('src')

      $.each $(newScripts).not(currentScripts).get(), -> # added
        $('head').append "<script type='text/javascript' src='#{ @ }'></script>"
      $.each $(currentScripts).not(newScripts).get(), -> # removed
        $("script[src='#{ @ }']").remove()

      currentStylesheets = $.map $('link[rel="stylesheet"]:not([href^=http])'), (el) -> $(el).attr('href')
      newStylesheets = $.map context.query('link[rel="stylesheet"]:not([href^=http])'), (el) -> $(el).attr('href')

      $.each $(newStylesheets).not(currentStylesheets).get(), -> # added
        $('head').append "<link type='text/css' href='#{ @ }' rel='stylesheet' />"
      $.each $(currentStylesheets).not(newStylesheets).get(), -> # removed
        $("link[rel='stylesheet'][href='#{ @ }']").remove()

      state.title = context.title

      if popstate then window.history.replaceState state, state.title, state.url
      else             window.history.pushState    state, state.title, state.url

      currentState = state

      document.activeElement.blur()
      $('title').text state.title
      $(settings.fragment).html context.query(settings.fragment).contents() if settings.fragment

      # alert settings.fragment

      settings.update.apply context
      $(document).trigger 'entree:update', [ context ]

    .always ->
      url = parseURL state.url
      if url.hash isnt ''
        # Avoid using simple hash set here. Will add another history entry. Replace the url with replaceState and scroll to target by hand.
        target = $(url.hash)
        if target.length then $(window).scrollTop target.offset().top
      else
        $(window).scrollTop 0
      settings.after.apply context
      $(document).trigger 'entree:after', [ context ]


    .fail ->
      settings.fail.apply context
      $(document).trigger 'entree:fail', [ context ]

  settings.before.apply context, [ done ]
  $(document).trigger 'entree:before', [ context, done ]

parseData = (data) ->
  obj = {}

  if /<html/i.test data
    $head = $(parseHTML(data.match(/<head[^>]*>([\s\S.]*)<\/head>/i)[0]))
    $body = $(parseHTML(data.match(/<body[^>]*>([\s\S.]*)<\/body>/i)[0]))
  else
    $head = $body = $(parseHTML(data))

  return obj if $body.length is 0 # If response data is empty, return fast

  obj.title = findAll($head, 'title').last().text()
  obj.title = $.trim(obj.title) if obj.title

  if settings.fragment
    # If they specified a fragment, look for it in the response and pull it out.
    if settings.fragment is 'body' then $fragment = $body
    else $fragment = findAll($body, settings.fragment).first()
    obj.contents = $fragment.contents() if ($fragment.length)
  else unless /<html/i.test(data)
    obj.contents = $body

  obj.head = $head
  obj.body = $body

  if obj.contents
    obj.contents = obj.contents.not -> $(this).is('title')
    obj.contents.find('title').remove()

  return obj

popState = (state) ->
  if state
    # When coming forward from a separate history session, will get an initial pop with a state we are already at. Skip reloading the current page.
    return if initialPop and initialURL is state.url

    # If popping back to the same state, just skip. Could be clicking back from hashchange rather than a pushState.
    log "Could be clicking back from hashchange rather than a pushState." if currentState.time is state.time
    return if currentState.time is state.time

    if currentState
      # Since state ids always increase, we can deduce the history direction from the previous state.
      direction = if currentState.time < state.time then 'forward' else 'back'
      pushState state, true
    else locationReplace(location.href)

  initialPop = false

findAll = (elems, selector) -> elems.filter(selector).add(elems.find(selector))
parseHTML = (html) -> $.parseHTML html, document, true
stateTime = -> (new Date).getTime()

parseURL = (url) ->
  a = document.createElement('a')
  a.href = url
  a

locationReplace = (url) ->
  window.history.replaceState null, "", "#"
  window.location.replace url

executeScriptTags = (scripts) ->
  return unless scripts
  $('script[src].entree-page-script').remove()
  existingScripts = $('script[src]')

  scripts.each ->
    src = @src
    matchedScripts = existingScripts.filter -> @src is src
    return if matchedScripts.length

    script = document.createElement 'script'
    script.type = $(this).attr 'type'
    script.src = $(this).attr 'src'
    script.class = 'entree-page-script'
    document.head.appendChild script

log = (msg) -> console?.log msg if settings.debug


# Add the state property to jQuery's event object so we can use it in $(window).bind('popstate')
$.event.props.push('state') if $.inArray('state', $.event.props) < 0

$.fn.extend
  entree: (options) ->
    settings = $.extend settings, options
    return @each -> entree @
