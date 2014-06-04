window.console = { log: -> } unless window.console

css =
  shadow:
    'background-color': 'black'
    'position': 'fixed'
    'left': 0
    'top': 0
    'width': '100%'
    'height': '100%'
    'z-index': 1000
    'opacity': 0.8
  player_box:
    'position': 'fixed'
    'left': '50%'
    'top': '50%'
    'width': 640
    'height': 480
    'margin-left': -320
    'margin-top': -240
    'z-index': 1001
  prev_button:
    'float': 'left'
  next_button:
    'float': 'right'

# courtesy of jquery
getScript = (url, success) ->
  script = document.createElement 'script'
  script.src = url
  head = document.getElementsByTagName('head')[0]
  done = false

  # Attach handlers for all browsers
  script.onload = script.onreadystatechange = ->
    ready = !@readyState || @readyState in ['loaded', 'complete']
    if !done && ready
      done = true
      success()
      script.onload = script.onreadystatechange = null
      head.removeChild script

  head.appendChild script


add_player = ($) ->
  # Use youtube's iframe embed instead of flash.
  # https://developers.google.com/youtube/iframe_api_reference
  $.getScript '//www.youtube.com/iframe_api'

  # Video list
  ids = []
  url = new RegExp 'https?://(www.)?youtube.com/'

  $('a[href^="http"]').each ->
    return unless $(this).attr('href').match url

    id = this.href.
      replace(/^.*v=/, '').
      replace(/\&.*$/, '')

    # Don't allow duplicates
    ids.push id unless id in ids

  console.log "video ids", ids


  # The index of the currently playing video
  index = 0

  # The youtube player
  player = null
  player_id = 'playlist_player'

  play_current = ->
    console.log 'Playing', index, ids[index]
    player.loadVideoById ids[index]

  play_next = ->
    index++
    index -= ids.length if index >= ids.length
    play_current()

  play_prev = ->
    index--
    index += ids.length if index < 0
    play_current()


  # Keyboard handlers
  cancel = ->
    $('#shadow, #player_box').remove()
    $(document).unbind 'keyup.player'

  $(document).bind 'keyup.player', (e) ->
    cancel() if e.keyCode == 27 # Escape
    play_next() if e.keyCode == 39 # Right
    play_prev() if e.keyCode == 37 # Left


  # Create the UI
  $shadow = $ '<div />',
    id: 'shadow'
    css: css.shadow
    click: cancel

  $player_box = $ '<div />',
    id: 'player_box'
    css: css.player_box

  $player = $ '<div />', id: player_id

  $prev_button = $ '<a />',
    href: 'javascript:;'
    text: 'previous'
    css: css.prev_button
    click: play_prev

  $next_button = $ '<a />',
    href: 'javascript:;'
    text: 'next'
    css: css.next_button
    click: play_next

  $player_box.append $player
  $('body').append $shadow
  $('body').append $player_box


  # Player events
  player_ready = (event) ->
    console.log 'player ready'
    $player_box.append($prev_button).append($next_button)
    event.target.playVideo()

  player_error = (event) ->
    errors =
      2: 'invalid video id'
      5: 'video not supported in html5'
      100: 'video removed or private'
      101: 'video not embedable'
      150: 'video not embedable'

    msg = errors[event.data] || 'unknown error'
    console.log "Error", msg

    # Remove the offending video
    ids.splice index, 1
    index = 0 if index >= ids.length
    play_current()

  player_state_change = (event) ->
    play_next() if event.data == YT.PlayerState.ENDED


  # Create the youtube player
  window.onYouTubeIframeAPIReady = ->
    player = new YT.Player player_id,
      height: '390'
      width: '640'
      videoId: ids[0]
      events:
        'onReady': player_ready
        'onError': player_error
        'onStateChange': player_state_change


# Use the page's jquery if it's on there
jquery_valid = false

if jQuery? && jQuery.fn && jQuery.fn.jquery
  version = jQuery.fn.jquery.split '.'
  # Need jquery version greater than 1.3 for object syntax
  if version.length == 3 && parseInt(version[1]) > 3
    console.log 'using in page jquery version', jQuery.fn.jquery
    add_player jQuery
    jquery_valid = true

unless jquery_valid
  getScript "//ajax.googleapis.com/ajax/libs/jquery/1.8/jquery.min.js", ->
    add_player jQuery.noConflict(true)
