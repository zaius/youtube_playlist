(function() {
  if (typeof console === "undefined") {
    console = { log: function() { } };
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
    $.getScript('https://ajax.googleapis.com/ajax/libs/swfobject/2.2/swfobject.js', function() {
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
      var index_inc = function() {
        index++;
        if (index >= ids.length) { index -= ids.length; }
      };
      var index_dec = function() {
        index--;
        if (index < 0) { index += ids.length; }
      };


      // Keyboard handlers
      var cancel = function() {
        $('#shadow, #player_box').remove();
        $(document).unbind('keyup.player');
      };

      $(document).bind('keyup.player', function(e) {
        if (e.keyCode == 27) {
          cancel();
        }
      });


      // The youtube player
      var player = null;
      var player_id = 'playlist_player';

      var play_current = function() {
        console.log('Playing: ', index, ids[index]);
        player.loadVideoById(ids[index]);
      };


      // Create the UI
      var $shadow = $('<div />', {
        id: 'shadow',
        css: {
          'background-color': 'black',
          'position': 'fixed',
          'left': 0, 'top': 0,
          'width': '100%', 'height': '100%',
          'z-index': 1000
        },
        click: cancel
      });

      var $player_box = $('<div />', {
        id: 'player_box',
        css: {
          'position': 'fixed',
          'left': '50%', 'top': '50%',
          'width': 320, 'height': 240,
          'margin-left': -160, 'margin-top': -120,
          'z-index': 1001
        }
      });
      var $player = $('<div />', { id: player_id });
      var $prev_button = $('<a />', {
        href: 'javascript:;',
        text: 'previous',
        css: { 'float': 'left' },
        click: function() {
          index_dec(); play_current();
        }
      });
      var $next_button = $('<a />', {
        href: 'javascript:;',
        text: 'next',
        css: { 'float': 'right' },
        click: function() {
          index_inc(); play_current();
        }
      });
      $player_box.append($player).append($prev_button).append($next_button);
      $('body').append($shadow).append($player_box);
      $shadow.css('opacity', 0.8);


      // Create the youtube flash player
      var params = { allowScriptAccess: "always" };
      var url = "//www.youtube.com/apiplayer?enablejsapi=1&version=3&playerapiid=" + player_id;
      swfobject.embedSWF(url, player_id, '320', '240', "9.0.0", null, null, params, {'id': player_id});


      // Youtube callback functions have to be global
      window.onYouTubePlayerReady = function(player_id) {
        player = document.getElementById(player_id);
        player.addEventListener('onStateChange', 'playerStateChanged');
        player.addEventListener('onError', 'playerOnError');
        play_current();
      };
      window.playerOnError = function(code) {
        console.log('error', code);
        // Remove the offending video
        ids.splice(index, 1);
        if (index >= ids.length) { index = 0; };
        play_current();
      };
      window.playerStateChanged = function(state) {
        // State code 0 means playback ended
        if (state == 0) {
          index_inc();
          play_current();
        }
      };
    });
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
