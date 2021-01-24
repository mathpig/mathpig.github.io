'use strict';

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
  } else {
    console.log('logged out');
  }
});

var nameBox = document.getElementById('nameBox');
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
