'use strict';

var screen = document.getElementById('screen');
var ctx = screen.getContext('2d');
var keys = {};
var roomRef;
var roomState = {};

var mainScreen = document.getElementById('main_screen');
var settingsScreen = document.getElementById('settings_screen');
var createGameScreen = document.getElementById('create_game_screen');
var findGameScreen = document.getElementById('find_game_screen');
var enterCodeScreen = document.getElementById('enter_code_screen');

var nameBox = document.getElementById('nameBox');

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
  var ref = firebase.database().ref('rooms').push();
  ref.set({
    name: nameBox.value,
    players: {
      [userId]: {
        x: Math.random() * 1000,
        y: Math.random() * 1000,
      },
    },
  }).then(function() {;
    JoinGame(ref.key);
  });
};

function RoomChange(snapshot) {
  roomState = snapshot.val();
}

function JoinGame(roomId) {
  ShowScreen(screen);
  roomRef = firebase.database().ref('rooms').child(roomId);
  roomRef.on('value', RoomChange);
  roomRef.update({
    players: {
      [userId]: {
        x: Math.random() * 1000,
        y: Math.random() * 1000,
      },
    },
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

  ctx.translate(screen.width / 2 - screen.height, 0);
  ctx.scale(screen.height / 1000, screen.height / 1000);
  ctx.translate(0, 1000);
  ctx.scale(1, -1);

  var pig = document.getElementById('pig4');
  var players = roomState['players'];
  if (players) {
    for (var player in players) {
      var p = players[player];
      ctx.drawImage(pig, p.x, p.y, pig.width, pig.height);
    }
  }

  ctx.restore();
}

function Tick() {
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
  firebase.database().ref('users/' + userId).set({
    name: nameBox.value,
  });
};

var userListRef = firebase.database().ref('rooms');
userListRef.on('value', (snapshot) => {
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
