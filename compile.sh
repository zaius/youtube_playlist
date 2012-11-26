#!/bin/bash
uglifyjs -m --stats < bookmarklet.js > bookmarklet.min.js
coffee -p -c youtube_playlist.coffee | uglifyjs -m --stats > youtube_playlist.min.js
