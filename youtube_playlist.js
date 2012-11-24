(function() {
  if (typeof console === "undefined") {
    console = { log: function() { } };
  }

  var css = {
    shadow: {
      'background-color': 'black',
      'position': 'fixed',
      'left': 0, 'top': 0,
      'width': '100%', 'height': '100%',
      'z-index': 1000,
      'opacity': 0.8
    },
    player_box: {
        'position': 'fixed',
        'left': '50%', 'top': '50%',
        'width': 640, 'height': 480,
        'margin-left': -320, 'margin-top': -240,
        'z-index': 1001
    },
    prev_button: { 'float': 'left' },
    next_button: { 'float': 'right' },
  }

  // courtesy of jquery
  var getScript = function(url, success) {
    var script = document.createElement('script');
    script.src = url;
    var head = document.getElementsByTagName('head')[0];
    var done = false;

    // Attach handlers for all browsers
    script.onload=script.onreadystatechange = function(){
      var ready = !this.readyState || this.readyState == 'loaded' || this.readyState == 'complete';
      if (!done && ready) {
        done=true;
        success();
        script.onload = script.onreadystatechange = null;
        head.removeChild(script);
      }
    };
    head.appendChild(script);
  };


  var add_player = function($) {
    $.getScript('//www.youtube.com/iframe_api');

    // Video list
    var ids = [];
    var url = new RegExp('https?://(www.)?youtube.com/');
    $('a[href^="http"]').filter(function() {
      return $(this).attr('href').match(url);
    }).each(function() {
      var id = this.href.
        replace(/^.*v=/, '').
        replace(/\&.*$/, '');

      // Don't allow duplicates
      if ($.inArray(id, ids) < 0) { ids.push(id); }
    });
    console.log("video ids", ids);


    // The index of the currently playing video
    var index = 0;


    // The youtube player
    var player = null;
    var player_id = 'playlist_player';

    var play_current = function() {
      console.log('Playing: ', index, ids[index]);
      player.loadVideoById(ids[index]);
    };
    var play_next = function() {
      index++;
      if (index >= ids.length) { index -= ids.length; }
      play_current();
    };
    var play_prev = function() {
      index--;
      if (index < 0) { index += ids.length; }
      play_current();
    };


    // Keyboard handlers
    var cancel = function() {
      $('#shadow, #player_box').remove();
      $(document).unbind('keyup.player');
    };

    $(document).bind('keyup.player', function(e) {
      if (e.keyCode == 27) { // Escape
        cancel();
      } else if (e.keyCode == 39) { // Right
        play_next();
      } else if (e.keyCode == 37) { // Left
        play_prev();
      }
    });

    // Create the UI
    var $shadow = $('<div />', {
      id: 'shadow',
      css: css.shadow,
      click: cancel
    });

    var $player_box = $('<div />', {
      id: 'player_box',
      css: css.player_box
    });

    var $player = $('<div />', { id: player_id });

    var $prev_button = $('<a />', {
      href: 'javascript:;',
      text: 'previous',
      css: css.prev_button,
      click: play_prev
    });

    var $next_button = $('<a />', {
      href: 'javascript:;',
      text: 'next',
      css: css.next_button,
      click: play_next
    });

    $player_box.append($player).append($prev_button).append($next_button);
    $('body').append($shadow).append($player_box);



    // Player events
    var player_ready = function(event) {
      console.log('player ready');
      event.target.playVideo();
    };

    var player_error = function(event) {
      errors = {
        2: 'invalid video id',
        5: 'video not supported in html5',
        100: 'video removed or private',
        101: 'video not embedable',
        150: 'video not embedable'
      }
      msg = errors[event.data] || 'unknown error';
      console.log("Error: " + msg);

      // Remove the offending video
      ids.splice(index, 1);
      if (index >= ids.length) { index = 0; };
      play_current();
    };

    var player_state_change = function(event) {
      if (event.data == YT.PlayerState.ENDED) {
        play_next();
      }
    };


    // Create the youtube player
    window.onYouTubeIframeAPIReady = function() {
      console.log('onYouTubeIframeAPIReady');
      player = new YT.Player(player_id, {
        height: '390',
        width: '640',
        videoId: ids[0],
        events: {
          'onReady': player_ready,
          'onError': player_error,
          'onStateChange': player_state_change
        }
      });
    };
  };


  // Use the page's jquery if it's on there
  var jquery_valid = false;

  if (typeof jQuery == 'function' && jQuery.fn && jQuery.fn.jquery) {
    var version = jQuery.fn.jquery.split('.');
    // Need jquery version greater than 1.3 for object syntax
    if (version.length == 3 && parseInt(version[1]) > 3) {
      console.log('using in page jquery version ' + jQuery.fn.jquery);
      add_player(jQuery);
      jquery_valid = true;
    }
  }

  if (!jquery_valid) {
    getScript("//ajax.googleapis.com/ajax/libs/jquery/1.8/jquery.min.js", function() {
      var jq18 = jQuery.noConflict(true);
      add_player(jq18);
    });
  }
})();
