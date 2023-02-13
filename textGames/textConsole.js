'use strict';

const MAX_LINES = 400;

inprompt.focus();
document.body.style.backgroundColor = 'black';

const COLORS = [
  'black',
  'red',
  'green',
  'yellow',
  'blue',
  'purple',
  'cyan',
  'white',
  'pink',
  'brown',
  'orange',
  'gray'
];

var fg_color, bg_color;
var pending = document.createElement('span');
var pending_lines = 0;
var output_lines = 0;
var added = [];
normal();

function countChar(s, ch) {
  var n = 0;
  var pos = 0;
  for (;;) {
    var i = s.indexOf(ch, pos);
    if (i >= 0) {
      pos = i + 1;
      n++;
    } else {
      break;
    }
  }
  return n;
}

function print(s, end) {
  if (end === undefined) {
    end = '\n';
  }
  var span = document.createElement('span');
  span.style.color = fg_color;
  span.style.backgroundColor = bg_color;
  span.innerText = s + end;
  pending.appendChild(span);
  pending_lines += countChar(s + end, '\n');
}

function foreground(c) {
  fg_color = COLORS[c];
}

function background(c) {
  bg_color = COLORS[c];
}

function normal() {
  fg_color = 'white';
  bg_color = 'black';
}

function flush() {
  added.push([pending, pending_lines]);
  output_lines += pending_lines;
  output.appendChild(pending);
  pending = document.createElement('span');
  pending_lines = 0;
  while (added.length > 1 && output_lines > MAX_LINES) {
    output.removeChild(added[0][0]);
    output_lines -= added[0][1];
    added.splice(0, 1);
  }
  window.scrollTo(0, document.body.clientHeight);
}

function get_string(message) {
  print(message, "");
  flush();
  return new Promise(function(resolve, reject) {
    inprompt.onkeydown = function(e) {
      if (e.key == 'Enter') {
        resolve(inprompt.value);
        print(inprompt.value);
        inprompt.value = '';
        inprompt.onkeydown = null;
      }
    };
  });
}

async function get_int(message) {
  while (true) {
    var n = await get_string(message);
    if (!n.match(/^[-]?[0-9]+$/)) {
      continue;
    }
    try {
      var v = parseInt(n);
      if (!isNaN(v)) {
        return v;
      }
    }
    catch (e) {
    }
  }
}

async function get_float(message) {
  while (true) {
    var n = await get_string(message);
    try {
      var v = parseFloat(n);
      if (!isNaN(v)) {
        return v;
      }
    }
    catch (e) {
    }
  }
}

function sleep(s) {
  flush();
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      resolve();
    }, s * 1000);
  });
}

function randint(x, y) {
  return x + Math.floor(Math.random() * (y - x + 1));
}

function shuffle(arr) {
  arr.sort((a, b) => randint(-1, 1));
}

function exit() {
  flush();
  return new Promise(function(resolve, reject) {});
}

function clear() {
  for (var i = 0; i < added.length; i++) {
    output.removeChild(added[i]);
  }
  added = [];
}
