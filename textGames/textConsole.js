'use strict';

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
  'white'
];

var fg_color, bg_color;
var pending = document.createElement('span');
normal();

function print(s, end) {
  if (end === undefined) {
    end = '\n';
  }
  var span = document.createElement('span');
  span.style.color = fg_color;
  span.style.backgroundColor = bg_color;
  span.innerText = s + end;
  pending.appendChild(span);
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
  output.appendChild(pending);
  pending = document.createElement('span');
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

function exit() {
  flush();
  return new Promise(function(resolve, reject) {});
}
