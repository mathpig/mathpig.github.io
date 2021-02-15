'use strict';

const SPEED = 5;

var screen = document.getElementById('screen');
var ctx = screen.getContext('2d');
var keys = {};
var roomRef;
var roomPlayersRef;
var roomState = {};
var roomPlayersRef;
var roomPlayers = {};
var playerIndex = 0;

var mainScreen = document.getElementById('main_screen');
var createGameScreen = document.getElementById('create_game_screen');
var findGameScreen = document.getElementById('find_game_screen');

var nameBox = document.getElementById('nameBox');
  
var pig = document.getElementById('pig4');

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

document.getElementById('create_game_button').onclick = function() {
  ShowScreen(createGameScreen);
};

document.getElementById('create_game_back').onclick = function() {
  ShowScreen(mainScreen);
};

document.getElementById('find_game_button').onclick = function() {
  ShowScreen(findGameScreen);
};

document.getElementById('find_game_back').onclick = function() {
  ShowScreen(mainScreen);
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
    return boardRef.update({    
      x: Math.random() * 1500,
      y: Math.random() * 1000,
    });
  }).then(function() {
    ShowScreen(screen);
    roomRef = firebase.database().ref().child('rooms').child(roomId).child('board');
    roomRef.on('value', RoomChange);
    playerIndex = index;
  });
}

function LeaveRoom() {
  roomRef.off('value', RoomChange);
  roomRef = undefined;
}

function DrawScreen() {
  ctx.fillStyle = '#303';
  ctx.fillRect(0, 0, screen.width, screen.height);

  ctx.save();

  ctx.translate(screen.width / 2 - screen.height / 2 * 1.5, 0);
  ctx.scale(screen.height / 1000, screen.height / 1000);
  ctx.translate(0, 1000);
  ctx.scale(1, -1);

  ctx.fillStyle = '#333';
  ctx.fillRect(0, 0, 1500, 1000);

  if (roomState) {
    for (var player in roomState) {
      var p = roomState[player];
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.translate(0, pig.height / 3);
      ctx.scale(1, -1);
      ctx.drawImage(pig, 0, 0, pig.width / 3, pig.height / 3);
      ctx.restore();
    }
  }

  ctx.restore();
}

function Tick() {
  if (!roomState[playerIndex]) {
    return;
  }
  var me = roomState[playerIndex];
  if (!me) {
    return;
  }
  var dirty = false;
  if (keys['ArrowLeft']) {
    me.x -= SPEED;
    dirty = true;
  }
  if (keys['ArrowRight']) {
    me.x += SPEED;
    dirty = true;
  }
  if (keys['ArrowDown']) {
    me.y -= SPEED;
    dirty = true;
  }
  if (keys['ArrowUp']) {
    me.y += SPEED;
    dirty = true;
  }
  if (me.x < 0) {
    me.x = 0;
  }
  if (me.x + pig.width / 3 > 1500) {
    me.x = 1500 - pig.width / 3;
  }
  if (me.y < 0) {
    me.y = 0;
  }
  if (me.y + pig.height / 3 > 1000) {
    me.y = 1000 - pig.height / 3;
  }
  var now = new Date().getTime();
  if (dirty) {
    var meRef = roomRef.child(playerIndex);
    meRef.update({
      x: me.x,
      y: me.y,
    }).catch(function() {
      ShowScreen(mainScreen);
    });
  }
}

function Update() {
  screen.width = window.innerWidth;
  screen.height = window.innerHeight;
  Tick();
  DrawScreen();
}

function KeyDown(e) {
  if (!keys[e.code]) {
  }
  keys[e.code] = true;
}

function KeyUp(e) {
  keys[e.code] = false;
}

setInterval(Update, 20);
window.onkeydown = KeyDown;
window.onkeyup = KeyUp;

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
    for (var i = 1; i <= 4; ++i) {
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
