'use strict';

var output = document.getElementById('output');
var input = document.getElementById('input');

function Resize() {
  output.style.height = window.innerHeight - input.clientHeight - 6;
}
window.onresize = Resize;
Resize();
input.focus();

function out(s) {
  output.value += s;
  output.scrollTop = output.scrollHeight;
}

input.onkeypress = function(e) {
  if (e.code == 'Enter') {
    var command = input.value;
    input.value = '';
    Command(command);
  }
}

function Command(cmd) {
  out('You said: ' + cmd + '\n');
}

out(`
Hi there I am a pig.
A pig.
Pig.
`);
