'use strict';

importScripts('noise.js', 'render_chunk.js', 'chunk.js');

onmessage = function(e) {
  var chunk = new Chunk();
  chunk.unpack(e.data);
  chunk.init(e.data);
  postMessage(chunk.pack(), [chunk.data.buffer]);
};
