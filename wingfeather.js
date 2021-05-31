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

class Entity {
  constructor() {
    this.called = [];
    this.name = 'something';
    this.description = 'It is undescribable.';
    this.contents = [];
    this.parent = null;
  }

  setCalled() {
    this.called = [];
    for (var i = 0; i < arguments.length; ++i) {
      this.called.push(arguments[i]);
    }
    return this;
  }

  setName(name) {
    this.name = name;
    return this;
  }

  setDescription(description) {
    this.description = description;
    return this;
  }

  remove() {
    if (this.parent != null) {
      this.parent.contents.splice(this.parent.contents.indexOf(this), 1);
    }
    return this;
  }

  move(destination) {
    this.remove();
    destination.contents.push(this);
    this.parent = destination;
    return this;
  }

  contains(o) {
    return this.contents.indexOf(o) >= 0;
  }

  isCalled(name) {
    return this.called.indexOf(name) >= 0;
  }

  find(name) {
    if (this.isCalled(name)) {
      return this;
    }
    for (var i = 0; i < this.contents.length; ++i) {
      var o = this.contents[i].find(name);
      if (o !== null) {
        return o;
      }
    }
    return null;
  }
}

// Your home.
var home = new Entity()
  .setName('home')
  .setCalled('home', 'room')
  .setDescription('Your home is simple but cozy.');
new Entity()
  .setName('a thwap')
  .setCalled('thwap', 'creature')
  .setDescription('This is a vicious thwap.')
  .move(home);
new Entity()
  .setName('a shovel')
  .setCalled('shovel')
  .setDescription('This is a shovel. You use it outside to collect hogpig droppings. ' +
                  'You have to return it to the Fangs before sundown unless you want ' +
                  'to be deported to Dang in the Black Carrige. ' +
                  'Fortunately, it is currently noon, ' +
                  'there are a few hours left before the sun goes down.')
  .move(home);
new Entity()
  .setName('a totato')
  .setCalled('totato')
  .setDescription('This is a totato. It is a sweet, bright red fruit. ' +
                  'The thwap looks like it would like it for itself.')
  .move(home);

// The player.
var player = new Entity()
  .setName('yourself')
  .setCalled('yourself', 'me', 'body', 'self')
  .setDescription('You are a twelve year old boy.')
  .move(home);

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

function List(title, o) {
  if (o.contents.length == 0) {
    return;
  }
  say('\n' + title);
  for (var i = 0; i < o.contents.length; ++i) {
    var item = o.contents[i];
    if (item === player) {
      continue;
    }
    say('  ' + item.name);
  }
}

function Look(noun) {
  if (noun === undefined) {
    var room = player.parent;
    say(room.description);
    if (room.contents.length) {
      List('You see:', room);
    }
  } else {
    var target = player.parent.find(noun);
    if (target) {
      say(target.description);
    } else {
      say("I don't see that here.");
    }
    if (target === player) {
      Inventory();
    }
  }
}

function Inventory() {
  if (player.contents.length == 0) {
    say('You have nothing.');
  } else {
    List('You have:', player);
  }
}

function Get(noun) {
  var target = player.parent.find(noun);
  if (target) {
    if (target === player) {
      say("You can't pick yourself up.");
    } else if (player.contains(target)) {
      say('You already have that.');
    } else {
      target.move(player);
      say('Taken.');
    }
  } else {
    say("From where? I don't see that here.");
  }
}

function Drop(noun) {
  var target = player.parent.find(noun);
  if (target) {
    if (player.contains(target)) {
      target.move(player.parent);
      say('Dropped.');
    } else {
      say("You don't have that.");
    }
  } else {
    say("You don't have that, and it isn't around here either.");
  }
}

function Do(verb, noun, target) {
  if (verb == 'look') {
    Look(noun);
  } else if (verb == 'get') {
    Get(noun);
  } else if (verb == 'drop') {
    Drop(noun);
  } else if (verb == 'inventory') {
    Inventory();
  } else {
    say('Huh?');
  }  
}

out(`
Welcome to the Wingfeather Saga.
Your name is Janner.

`);
