'use strict';

const WIDTH = 750;
const HEIGHT = 750;
const LEVELS = 2;

var map = new Uint8Array(WIDTH * HEIGHT * LEVELS);
window.onload = function() {
  fetch("map.data").then(function(response) {
    if (!response.ok) {
      return;
    }
    response.arrayBuffer().then(function(buffer) {
      var nmap = new Uint8Array(buffer);
      for (var i = 0; i < WIDTH * HEIGHT * LEVELS; ++i) {
        map[i] = nmap[i];
      }
      Init();
    });
  });
};

function Save() {
  const blob = new Blob([map], {type: 'text/plain'});
  const anchor = window.document.createElement('a');
  anchor.href = window.URL.createObjectURL(blob);
  anchor.download = 'map.data';
  document.body.appendChild(anchor);
  anchor.click();        
  document.body.removeChild(anchor);
}

function toMap(a) {
  return Math.floor(a[0]) + Math.floor(a[1]) * WIDTH + level * WIDTH * HEIGHT;
}

function tileAt(x, y) {
  var t = map[toMap([x / zoom, y / zoom])];
  var r = tiles[t];
  if (r) {
    return r;
  }
  return tiles[0];
}
