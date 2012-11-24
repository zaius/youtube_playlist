#!/bin/bash
coffee -c youtube_playlist.coffee
uglifyjs -m --stats < bookmarklet.js > bookmarklet.min.js
uglifyjs -m --stats < youtube_playlist.js > youtube_playlist.min.js
