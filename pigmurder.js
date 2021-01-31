'use strict';

var mainScreen = document.getElementById('main_screen');
var settingsScreen = document.getElementById('settings_screen');
var createGameScreen = document.getElementById('create_game_screen');
var findGameScreen = document.getElementById('find_game_screen');
var enterCodeScreen = document.getElementById('enter_code_screen');

document.getElementById('create_game_button').onclick = function() {
  mainScreen.style.display = 'none';
  createGameScreen.style.display = '';
};

document.getElementById('create_game_back').onclick = function() {
  createGameScreen.style.display = 'none';
  mainScreen.style.display = '';
};

document.getElementById('find_game_button').onclick = function() {
  mainScreen.style.display = 'none';
  findGameScreen.style.display = '';
};

document.getElementById('find_game_back').onclick = function() {
  findGameScreen.style.display = 'none';
  mainScreen.style.display = '';
};

document.getElementById('enter_code_button').onclick = function() {
  mainScreen.style.display = 'none';
  enterCodeScreen.style.display = '';
};

document.getElementById('enter_code_back').onclick = function() {
  enterCodeScreen.style.display = 'none';
  mainScreen.style.display = '';
};

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

var userListRef = firebase.database().ref('users');
userListRef.on('value', (snapshot) => {
  const data = snapshot.val();
  var items = '';
  for (var user in data) {
    items += data[user].name + '\n';
  }
  var userList = document.getElementById('userList');
  userList.innerText = items;
});
