'use strict';

var online = (function() {
document.write(`
<div id="main_screen" class="screen">
  <h1 id="game_title"></h1>
  Your Name:<br/>
  <input id="name_box" size="40" maxlength="40"><br/><br/>
  <button id="solo_game_button">Single Player Game</button><br/><br/>
  <button id="create_game_button">Create Multiplayer Game</button><br/><br/>
  <button id="find_game_button">Find Multiplayer Game</button><br/><br/>
</div>
<div id="create_game_screen" class="screen" style="display:none">
  <h1>Create New Game</h1>
  <button id="create_game_back">Back</button><br/><br/>
  <button id="create_game_go_button1" data-player-index="1">Create (Player 1)</button><br/><br/>
  <button id="create_game_go_button2" data-player-index="2">Create (Player 2)</button><br/><br/>
  <button id="create_game_go_button3" data-player-index="3">Create (Player 3)</button><br/><br/>
  <button id="create_game_go_button4" data-player-index="4">Create (Player 4)</button><br/><br/>
</div>
<div id="find_game_screen" class="screen" style="display:none">
  <h1>Join Public Game</h1>
  Game List:<br/>
  <div id="game_list"></div>
  <button id="find_game_back">Back</button>
</div>
`);

var solo = false;
var maxPlayers = 4;
var roomRef;
var roomPlayersRef;
var roomState = {};
var roomPlayersRef;
var roomPlayers = {};
var playerIndex = 0;
var playerState = {
  data: '{}',
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  level: 0,
  angle: 0,
  key0: 0,
  key1: 0,
  key2: 0,
  key3: 0,
  key4: 0,
  key5: 0,
};

var screen = document.getElementById('screen');
var mainScreen = document.getElementById('main_screen');
var createGameScreen = document.getElementById('create_game_screen');
var findGameScreen = document.getElementById('find_game_screen');
var nameBox = document.getElementById('name_box');

var firebaseConfig = {
  apiKey: "AIzaSyBCZBtI9hsU_F03ijDmlDDyfO-k8iQee1A",
  authDomain: "piggies.firebaseapp.com",
  databaseURL: "https://piggies-default-rtdb.firebaseio.com",
  projectId: "piggies",
  storageBucket: "piggies.appspot.com",
  messagingSenderId: "848333736113",
  appId: "1:848333736113:web:94d95a4559e64820f43a90",
  measurementId: "G-TY44QGVMY1"
};
firebase.initializeApp(firebaseConfig);

firebase.analytics();
firebase.auth();
var database = firebase.database();
var userId;

function HideAllScreens() {
  var screens = document.getElementsByClassName('screen');
  for (var i = 0; i < screens.length; ++i) {
    screens[i].style.display = 'none';
  }
}

function ShowScreen(screen) {
  HideAllScreens();
  screen.style.display = '';
}

history.replaceState({page: 'main'}, 'Main Screen');

window.addEventListener('popstate', function(e) {
  roomState = {};
  switch (e.state.page) {
    case 'main':
      ShowScreen(mainScreen);
      break;
    case 'create':
      ShowScreen(createGameScreen);
      break;
    case 'find':
      ShowScreen(findGameScreen);
      break;
    case 'play':
      history.back();
      break;
  }
  if (roomRef !== undefined) {
    roomRef.off('value', RoomChange);
  }
});

document.getElementById('create_game_button').onclick = function() {
  solo = false;
  ShowScreen(createGameScreen);
  history.pushState({page: 'create'}, 'Create Multiplayer Game');
};

document.getElementById('solo_game_button').onclick = function() {
  solo = true;
  playerIndex = 1;
  roomState[playerIndex] = playerState;
  ShowScreen(screen);
  history.pushState({page: 'game'}, 'Play');
};

document.getElementById('create_game_back').onclick = function() {
  history.back();
};

document.getElementById('find_game_button').onclick = function() {
  ShowScreen(findGameScreen);
  history.pushState({page: 'find'}, 'Find Multiplayer Game');
};

document.getElementById('find_game_back').onclick = function() {
  history.back();
};

document.getElementById('create_game_go_button1').onclick = CreateGame;
document.getElementById('create_game_go_button2').onclick = CreateGame;
document.getElementById('create_game_go_button3').onclick = CreateGame;
document.getElementById('create_game_go_button4').onclick = CreateGame;

function CreateGame(e) {
  if (!userId) {
    return;
  }
  HideAllScreens();
  var newRoom = {
    lastActive: firebase.database.ServerValue.TIMESTAMP,
    players: {
      [e.target.dataset.playerIndex]: userId,
    }
  };
  firebase.database().ref().child('rooms').child(userId).set(newRoom).then(function() {
    var publicRoomRef = firebase.database().ref().child('publicRooms').child(userId);
    return publicRoomRef.update({
      name: nameBox.value,
      lastActive: firebase.database.ServerValue.TIMESTAMP,
      1: e.target.dataset.playerIndex == 1,
      2: e.target.dataset.playerIndex == 2,
      3: e.target.dataset.playerIndex == 3,
      4: e.target.dataset.playerIndex == 4,
    });
  }).then(function() {
    roomPlayersRef = firebase.database().ref().child('rooms').child(userId).child('players');
    roomPlayersRef.on('value', PlayersChange);
    JoinGame(userId, e.target.dataset.playerIndex);
  });
};

function UpdatePlayers() {
  var publicRoomRef = firebase.database().ref().child('publicRooms').child(userId);
  return publicRoomRef.update({
    name: nameBox.value,
    lastActive: firebase.database.ServerValue.TIMESTAMP,
    1: roomPlayers['1'] !== undefined,
    2: roomPlayers['2'] !== undefined,
    3: roomPlayers['3'] !== undefined,
    4: roomPlayers['4'] !== undefined,
  });
}

function PlayersChange(snapshot) {
  roomPlayers = snapshot.val();
  UpdatePlayers();
}

function RoomChange(snapshot) {
  roomState = snapshot.val();
}

function JoinGame(roomId, index) {
  var playersRef = firebase.database().ref().child('rooms').child(roomId).child('players');
  playersRef.update({
    [index]: userId,
  }).then(function() {
    playersRef.child(index).onDisconnect().remove();
    var boardRef = firebase.database().ref().child('rooms').child(roomId).child('board').child(index);
    boardRef.onDisconnect().remove();
    return boardRef.update(playerState);
  }).then(function() {
    ShowScreen(screen);
    roomRef = firebase.database().ref().child('rooms').child(roomId).child('board');
    roomRef.on('value', RoomChange);
    playerIndex = index;
    history.pushState({page: 'play'}, 'Play');
  });
}

function LeaveRoom() {
  roomRef.off('value', RoomChange);
  roomRef = undefined;
}

firebase.auth().signInAnonymously()
  .then(() => {
    console.log('logged in successfully');
  })
  .catch((error) => {
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log('failed to log in: ' + errorMessage);
  });

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    userId = user.uid;
    console.log('my id is: ' + userId);
    firebase.database().ref('users').child(userId).child('name').once('value').then((snapshot) => {
      nameBox.value = snapshot.val();
    });
    var myRoomRef = firebase.database().ref().child('rooms').child(userId);
    myRoomRef.onDisconnect().remove();
    var myPublicRoomRef = firebase.database().ref().child('publicRooms').child(userId);
    myPublicRoomRef.onDisconnect().remove();
  } else {
    console.log('logged out');
  }
});

nameBox.oninput = function() {
  if (!userId) {
    return;
  }
  firebase.database().ref('users').child(userId).update({
    name: nameBox.value,
  });
};

var publicRoomListRef = firebase.database().ref('publicRooms');
publicRoomListRef.on('value', (snapshot) => {
  var gameList = document.getElementById('game_list');
  gameList.innerHTML = '';
  const rooms = snapshot.val();
  for (var r in rooms) {
    var room = rooms[r];
    if (room[1] && room[2] && room[3] && room[4]) {
      continue;
    }
    var item = document.createElement('div');
    var name = document.createElement('span');
    name.innerText = room.name + ' ';
    item.appendChild(name);
    for (var i = 1; i <= maxPlayers; ++i) {
      if (room[i]) {
        continue;
      }
      var button = document.createElement('button');
      button.innerText = 'Join as Player' + i;
      button.gameId = r;
      button.gameIndex = i;
      button.onclick = function(e) {
        HideAllScreens();
        JoinGame(e.target.gameId, e.target.gameIndex);
      };
      item.appendChild(button);
    }
    gameList.appendChild(item);
  }
});

class Online {
  constructor() {
    this.mainScreen = document.getElementById('main_screen');
    this.createGameScreen = document.getElementById('create_game_screen');
    this.findGameScreen = document.getElementById('find_game_screen');
    this.nameBox = document.getElementById('name_box');
  }

  setTitle(name) {
    document.getElementById('game_title').innerText = name;
  }

  setMaxPlayers(n) {
    maxPlayers = n;
    for (var i = 1; i <= 4; ++i) {
      var button = document.getElementById('create_game_go_button' + i);
      button.style.display = i <= n ? '' : 'none';
    }
  }

  playerNumber() {
    return playerIndex;
  }

  playing() {
    return roomState[this.playerNumber()];
  }

  player(i) {
    if (i == this.playerNumber()) {
      return this.me();
    }
    return roomState[i];
  }

  me() {
    return playerState;
  }

  players() {
    var keys = {};
    for (var i in roomState) {
      if (i != 'world') {
        keys[i] = true;
      }
    }
    return keys;
  }

  headPlayer() {
    for (var i = 1; i < this.playerNumber(); ++i) {
      if (roomState[i] !== undefined) {
        return false;
      }
    }
    return true;
  }

  syncWorld(o) {
    if (solo) {
      return;
    }
    var world = roomState['world'];
    if (world === undefined) {
      world = {
        data: '{}'
      };
    }
    var worldData = JSON.parse(world['data']);
    var unsynced = o['unsynced'];
    if (unsynced === undefined) {
      unsynced = [];
    }
    if (this.headPlayer()) {
      var dirty = false;
      var data = {};
      for (var key in o) {
        if (key == 'unsynced' || key == 'playerNumber' || unsynced.indexOf(key) >= 0) {
          continue;
        }
        data[key] = o[key];
        if (worldData[key] != data[key]) {
          dirty = true;
        }
      }
      if (dirty) {
        world['data'] = JSON.stringify(data, Object.keys(data).sort());
        var worldRef = roomRef.child('world');
        worldRef.update(world).catch(function() {
          roomState = {};
          ShowScreen(mainScreen);
        });
      }
    } else {
      for (var key in o) {
        if (key == 'unsynced' || unsynced.indexOf(key) >= 0) {
          continue;
        }
        o[key] = worldData[key];
      }
    }
  }

  syncPlayer(o) {
    if (solo) {
      return;
    }
    if (o.playerNumber === undefined) {
      return;
    }
    var p = this.player(o.playerNumber);
    if (p === undefined || p.data === undefined) {
      return;
    }
    var unsynced = o['unsynced'];
    if (unsynced === undefined) {
      unsynced = [];
    }
    if (o.playerNumber == this.playerNumber()) {
      var data = {};
      for (var key in o) {
        if (key == 'unsynced' || unsynced.indexOf(key) >= 0) {
          continue;
        }
        data[key] = o[key];
      }
      p.data = JSON.stringify(data, Object.keys(data).sort());
      this.update();
    } else {
      for (var key in o) {
        var data = JSON.parse(p.data);
        if (key == 'unsynced' || unsynced.indexOf(key) >= 0) {
          continue;
        }
        if (data[key] !== undefined) {
          o[key] = data[key];
        }
      }
    }
  }

  update() {
    if (solo) {
      return;
    }
    var dirty = false;
    var oldState = roomState[this.playerNumber()];
    if (!oldState) {
      return;
    }
    for (var k in playerState) {
      if (oldState[k] != playerState[k]) {
        dirty = true;
      }
    }
    if (dirty) {
      Object.assign(roomState[this.playerNumber()], playerState);
      var meRef = roomRef.child(playerIndex);
      meRef.update(playerState).catch(function() {
        roomState = {};
        ShowScreen(mainScreen);
      });
    }
  }

  quit() {
    history.back();
  }
}

return new Online();

})();

