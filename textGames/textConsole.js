'use strict';

inprompt.focus();

var text = '';

function print(s, end) {
  if (end === undefined) {
    end = '\n';
  }
  output.innerText += s + end;
  window.scrollTo(0, document.body.clientHeight);
}

function get_string() {
  return new Promise(function(resolve, reject) {
    inprompt.onkeydown = function(e) {
      if (e.key == 'Enter') {
        resolve(inprompt.value);
        inprompt.value = '';
        inprompt.onkeydown = null;
      }
    };
  });
}

function sleep(s) {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      resolve();
    }, s * 1000);
  });
}

function randint(x, y) {
  return x + Math.floor(Math.random() * (y - x + 1));
}
