(function() {
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


  // Reddit is stuck on 1.3, and I want object syntax for element creation
  getScript("//ajax.googleapis.com/ajax/libs/jquery/1.4.4/jquery.min.js", function() {
    var jq14 = jQuery.noConflict(true);

    (function($) {
      $.getScript('https://ajax.googleapis.com/ajax/libs/swfobject/2.2/swfobject.js', function() {
        // Video list
        var ids = [];
        $('a[href^="http://www.youtube"]').each(function() {
          var id = this.href.
            replace(/^.*v=/, '').
            replace(/\&.*$/, '');

          // Don't allow duplicates
          if ($.inArray(id, ids) < 0) ids.push(id);
        });
        console.log("video ids", ids);


        // The index of the currently playing video
        var index = 0;
        var index_inc = function() {
          index++;
          if (index >= ids.count) index -= ids.length;
        }
        var index_dec = function() {
          index--;
          if (index < 0) index += ids.length;
        }


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
          }
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
          css: { float: 'left' },
          onclick: function() {
            index_dec(); play_current();
          }
        });
        var $next_button = $('<a />', {
          href: 'javascript:;',
          text: 'next',
          css: { float: 'right' },
          onclick: function() {
            index_inc(); play_current();
          }
        });
        $player_box.append($player).append($prev_button).append($next_button);
        $('body').append($shadow).append($player_box);
        $shadow.css('opacity', 0.8);


        // Create the youtube flash player
        var params = { allowScriptAccess: "always" };
        var url = "http://www.youtube.com/apiplayer?enablejsapi=1&version=3&playerapiid=" + player_id
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
        };
        window.playerStateChanged = function(state) {
          // State code 0 means playback ended
          if (state == 0) {
            index_inc();
            play_current();
          }
        };
      });
    })(jq14);
  });
})();
