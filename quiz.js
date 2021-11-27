'use strict';

function Generate() {
  var probability = parseFloat(percentage.value) / 100;

  var output = '';
  var text = quiz.value;
  var lines = text.split('\n');
  for (var i = 0; i < lines.length; ++i) {
    var line = lines[i] + ' ';
    line = line.replace('"', "''");
    var word = '';
    for (var j = 0; j < line.length; ++j) {
      var ch = line[j];
      if (!ch.match(/[A-Za-z0-9%]/)) {
        if (word.length == 0) {
          word += ch;
          continue;
        }
        if (Math.random() <= probability) {
          output += '<input size="' + word.length + '" data-answer="' + word + '"></input>' + ch;
        } else {
          output += word + ch;
        }
        word = '';
      } else {
        word += ch;
      }
    }
    output += '<br/>';
  }
  output += '<button onclick="Check()">Check</button><br/>';
  output += '<button onclick="Generate()">Regenerate</button><br/>';
  output_panel.innerHTML = output;
}

function Check() {
  var things = output_panel.getElementsByTagName('input');
  for (var i = 0; i < things.length; ++i) {
    var thing = things[i];
    if (thing.value === thing.getAttribute('data-answer')) {
      thing.style.backgroundColor = 'green';
    } else {
      thing.style.backgroundColor = 'red';
    }
  }
}


generate.onclick = function() {
  input_panal.style.display = 'none';
  Generate();
};
