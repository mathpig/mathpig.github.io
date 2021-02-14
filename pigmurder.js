'use strict';

const SPEED = 5;

var screen = document.getElementById('screen');
var ctx = screen.getContext('2d');
var keys = {};
var roomRef;
var roomState = {};
var lastUpdated = new Date().getTime();

var mainScreen = document.getElementById('main_screen');
var settingsScreen = document.getElementById('settings_screen');
var createGameScreen = document.getElementById('create_game_screen');
var findGameScreen = document.getElementById('find_game_screen');
var enterCodeScreen = document.getElementById('enter_code_screen');

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

document.getElementById('enter_code_button').onclick = function() {
  ShowScreen(enterCodeScreen);
};

document.getElementById('enter_code_back').onclick = function() {
  ShowScreen(mainScreen);
};

document.getElementById('settings_button').onclick = function() {
  ShowScreen(settingsScreen);
};

document.getElementById('settings_back').onclick = function() {
  ShowScreen(mainScreen);
};

document.getElementById('create_game_go_button').onclick = function() {
  if (!userId) {
    return;
  }
  HideAllScreens();
  var roomRef = firebase.database().ref().child('publicRooms').push();
  roomRef.update({
    name: nameBox.value,
  }).then(function() {
    JoinGame(roomRef.key);
  });
};

function RoomChange(snapshot) {
  roomState = snapshot.val();
}

function JoinGame(roomId) {
  ShowScreen(screen);
  var me = firebase.database().ref().child('rooms').child(roomId).child('players').child(userId);
  me.update({
    x: Math.random() * 1500,
    y: Math.random() * 1000,
    lastActive: firebase.database.ServerValue.TIMESTAMP,
  }).then(function() {
    roomRef = firebase.database().ref().child('rooms').child(roomId);
    roomRef.on('value', RoomChange);
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

  var players = roomState['players'];
  if (players) {
    for (var player in players) {
      var p = players[player];
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
  if (!roomState['players']) {
    return;
  }
  var me = roomState.players[userId];
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
  if (dirty || now > lastUpdated + 1000) {
    var meRef = roomRef.child('players').child(userId);
      meRef.update({
      x: me.x,
      y: me.y,
      lastActive: firebase.database.ServerValue.TIMESTAMP,
    });
    lastUpdated = now;
  }
  for (var i in roomState['players']) {
    var player = roomState['players'][i];
    if (player.lastActive < now - 2500) {
      var ref = roomRef.child('players').child(i);
      ref.remove();
    }
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
    var item = document.createElement('div');
    var name = document.createElement('span');
    name.innerText = room.name + ' ';
    item.appendChild(name);
    var button = document.createElement('button');
    button.innerText = 'Join';
    button.gameId = r;
    button.onclick = function(e) {
      HideAllScreens();
      JoinGame(e.target.gameId);
    };
    item.appendChild(button);
    gameList.appendChild(item);
  }
});
