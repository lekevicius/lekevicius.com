pageFunction = ->
    console.log 'Live from Post custom script!'

$(document).on 'ready entree:update', pageFunction
$(document).on 'entree:before', -> $(document).off 'entree:update', pageFunction

