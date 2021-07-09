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
    this.directions = {};
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

  addDirection(name, destination) {
    this.directions[name] = destination;
  }
}

function GetCell(rows, i, j) {
  if (j < 0 || j >= rows.length) {
    return undefined;
  }
  var row = rows[j];
  if (i < 0 || i >= row.length) {
    return undefined;
  }
  return row[i];
}

function SetCellDirection(rows, i, j, name, o) {
  var cell = GetCell(rows, i, j);
  if (cell && o) {
    cell.addDirection(name, o);
  }
}

function Map(rows, diagonals) {
  for (var y = 0; y < rows.length; ++y) {
    for (var x = 0; x < rows[y].length; ++x) {
      SetCellDirection(rows, x, y, 'south', GetCell(rows, x, y + 1));
      SetCellDirection(rows, x, y, 'north', GetCell(rows, x, y - 1));
      SetCellDirection(rows, x, y, 'east', GetCell(rows, x + 1, y));
      SetCellDirection(rows, x, y, 'west', GetCell(rows, x - 1, y));
      if (diagonals) {
        SetCellDirection(rows, x, y, 'northeast', GetCell(rows, x + 1, y - 1));
        SetCellDirection(rows, x, y, 'northwest', GetCell(rows, x - 1, y - 1));
        SetCellDirection(rows, x, y, 'southeast', GetCell(rows, x + 1, y + 1));
        SetCellDirection(rows, x, y, 'southwest', GetCell(rows, x - 1, y + 1));
      }
    }
  }
}

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
  .setName('a totato')
  .setCalled('totato')
  .setDescription('This is a totato. It is a sweet, bright red fruit. ' +
                  'Thwaps are known to like totatos, ' +
                  'so you should pick this up if there is a thwap nearby. ')
  .move(home);

var field = new Entity()
  .setName('field')
  .setCalled('field')
  .setDescription('Your grandfather\'s totato field. ');

new Entity()
  .setName('a shovel')
  .setCalled('shovel')
  .setDescription('This is a shovel. ' +
                  'You use it outside to collect hogpig droppings. ' +
                  'You have to return it to the Fang regiments before sundown, ' +
                  'unless you want to be deported to Dang in the Black Carrige. ')
  .move(field);

var trees = new Entity()
  .setName('trees')
  .setCalled('trees') 
  .setDescription('There is a clump of trees growing here. ');

var trees_sea = new Entity()
  .setName('trees')
  .setCalled('trees')
  .setDescription('There is a clump of trees growing here. The Dark Sea is to the east.')

var grass = new Entity()
  .setName('grass')
  .setCalled('grass')
  .setDescription('There is grass growing here. ');

var cliff = new Entity()
  .setName('cliff')
  .setCalled('cliff')
  .setDescription('You are on a cliff sloping towards the east. The Dark Sea of Darkness is in front of you.')

var sea = new Entity()
  .setName('sea')
  .setCalled('sea')
  .setDescription('You fall into the Dark Sea of Darkness and die. ')

var grass_road = new Entity()
  .setName('grass')
  .setCalled('grass')
  .setDescription('There is grass growing here. You are on the Main Road of the Glipwood Township. ')

var river = new Entity()
  .setName('river')
  .setCalled('river')
  .setDescription('You fall into the Mighty River Blapp and die. ')

var road = new Entity()
  .setName('road')
  .setCalled('road')
  .setDescription('You are on the Main Road. ')

var trees_river1 = new Entity()
  .setName('trees')
  .setCalled('trees')
  .setDescription('A clump of trees is growing here. The Mighty River Blapp lies to the north. ')

var trees_river2 = new Entity()
  .setName('trees')
  .setCalled('trees')
  .setDescription('A clump of trees is growing here. The Mighty River Blapp lies to the northwest, and the Dark Sea of Darkness lies to the north. ')

var inn = new Entity()
  .setName('inn')
  .setCalled('inn')
  .setDescription('You are in Glipwood\'s only inn. The inkeeper asks you if you would like to stay in the inn for the night. ')

var books = new Entity()
  .setName('Books and Crannies')
  .setCalled('Books and Crannies')
  .setDescription('You are in Books and Crannies. Oskar R. Reteep is at the front desk. You notice Zouzab Koit standing on top of a shelf. ')

Map(
  [
    [undefined, undefined,    undefined,    undefined, undefined, undefined],
    [undefined, river,        sea,          sea,       sea,       undefined],
    [undefined, trees_river1, trees_river2, trees_sea, sea,       undefined],
    [undefined, trees,        home,         cliff,     sea,       undefined],
    [undefined, field,        grass_road,   trees_sea, sea,       undefined],
    [undefined, road,         road,         road,      trees,     undefined],
    [undefined, books,        books,        road,      inn,       undefined],
    [undefined, undefined,    undefined,    undefined, undefined, undefined],
  ], true
)

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

const DIRECTIONS = ['north', 'south', 'east', 'west',
                    'northeast', 'northwest', 'southeast', 'southwest',
                    'up', 'down'];

const SYNONYMS = {
  'take': 'get',
  'grab': 'get',
  'snatch': 'get',
  'examine': 'look',
  'investigate': 'look',
  'n': 'north',
  's': 'south',
  'e': 'east',
  'w': 'west',
  'ne': 'northeast',
  'nw': 'northwest',
  'se': 'southeast',
  'sw': 'southwest',
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
  if (o.contents.length == 0 ||
      (o.contents.length == 1 && o.contents[0] === player)) {
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
  if (noun == 'all') {
    var room = player.parent;
    for (var i = 0; i < room.contents.length; i++) {
      if (room.contents[i] !== player) {
        room.contents[i].move(player);
        --i;
      }
    }
    out('Taken.');
    return;
  }
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
  if (noun == 'all') {
    for (var i = 0; i < player.contents.length; i++) {
      player.contents[i].move(player.parent);
      --i;
    }
    out('Dropped.');
    return;
  }
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

function Go(direction) {
  var room = player.parent;
  var x = room.directions[direction];
  if (x === undefined) {
    say('There is no exit that way.');
    return;
  }
  player.move(x);
  Look();
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
  } else if (verb == 'go') {
    Go(noun);
  } else if (verb == 'pick' && noun == 'up') {
    Get(target);
  } else if (verb == 'put' && noun == 'down') {
    Drop(target);
  } else {
    if (DIRECTIONS.indexOf(verb) >= 0) {
      Go(verb);
      return;
    }
    say('Huh?');
  }  
}

out(`
Welcome to the Wingfeather Saga.
Your name is Janner.

`);
Look();
