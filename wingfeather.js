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

var currentRoom = 'home';
var THINGS = {
  'home': {
    'name': 'Your home.',
    'description': 'Your home is simple but cozy.',
    'contents': ['thwap', 'shovel', 'totato'],
  },
  'thwap': {
    'name': 'a thwap',
    'description': 'This is a vicious thwap.',
  },
  'shovel': {
    'name': 'a shovel',
    'description': 'This is a shovel. You use it outside to collect hogpig droppings. You have to return it to the Fangs before sundown unless you want to be deported to Dang in the Black Carrige. Fortunately, it is currently noon, there are a few hours left before the sun goes down.',
  },
  'totato': {
    'name': 'a totato',
    'description': 'This is a totato. It is a sweet, bright red fruit. The thwap looks like it would like it for itself.',
  },
};

const STOP_WORDS = [
  'to',
  'the',
  'a',
  'an',
  'by',
  'with',
  'in',
  'at',
  'on',
  'over',
  'around',
];

const SYNONYMS = {
  'take': 'get',
  'grab': 'get',
  'snatch': 'get',
  'examine': 'look',
  'investigate': 'look',
};

function Command(cmd) {
  out('\n> ' + cmd + '\n');
  var words = cmd.split(/[^A-Za-z0-9-']+/);
  var nwords = [];
  for (var i = 0; i < words.length; ++i) {
    var word = words[i].toLowerCase();
    if (STOP_WORDS.indexOf(word) >= 0) {
      continue;
    }
    if (SYNONYMS[word] !== undefined) {
      word = SYNONYMS[word];
    }
    nwords.push(word);
  }
  if (nwords.length <= 3) {
    Do(nwords[0], nwords[1], nwords[2]);
  } else {
    Do('confusion');
  }
}

function say(s) {
  out(s + '\n');
}

function Find(thing) {
  var room = THINGS[currentRoom];
  for (var i = 0; i < room.contents.length; ++i) {
    var item = THINGS[room.contents[i]];
    if (thing == item) {
      return thing;
    }
  } 
  for (var i = 0; i < room.contents.length; ++i) {
    var item = THINGS[room.contents[i]];
    if (item.name.indexOf(thing) >= 0) {
      return room.contents[i];
    }
  } 
  for (var i = 0; i < room.contents.length; ++i) {
    var item = THINGS[room.contents[i]];
    if (item.description.indexOf(thing) >= 0) {
      return room.contents[i];
    }
  } 
}

function Look(noun) {
  var room = THINGS[currentRoom];
  if (noun === undefined) {
    say(room.description);
    if (room.contents.length) {
      say('\nYou see:');
      for (var i = 0; i < room.contents.length; ++i) {
        var item = THINGS[room.contents[i]];
        say('  ' + item.name);
      }
    }
  } else {
    var target = Find(noun);
    if (target) {
      say(THINGS[target].description);
    } else {
      say("I don't see a(n) \"" + noun + "\" here.");
    }
  }
}

function Do(verb, noun, target) {
  var room = THINGS[currentRoom];
  if (verb == 'look') {
    Look(noun);
  } else {
    say('Huh?');
  }  
}

out(`
Welcome to the Wingfeather Saga.
Your name is Janner.

`);
