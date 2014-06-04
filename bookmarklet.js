(function() {
  var url = "https://raw.githubusercontent.com/zaius/youtube_playlist/master/youtube_playlist.min.js";
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = url;
  var head = document.getElementsByTagName('head')[0];
  head.appendChild(script);
})();
