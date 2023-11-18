'use strict';

var m = 0;

var derivatives = [0, 0, 0, 0, 0, 0, 0, 0, 0];

var key = "filler";

function scientific(val) {
  // TODO: Scientific notation for large numbers
}

function Tick() {
  stats.innerHTML = "Money: " + scientific(m) + "<br/><br/>";
  // TODO: List derivatives
  // TODO: Detect keystrokes to add money or buy derivatives
}

setInterval(Tick, 20);

window.onkeydown = function(e) {
  key = e.key;
};
