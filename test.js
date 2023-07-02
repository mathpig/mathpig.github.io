'use strict';

function randint(a, b) {
  return a + Math.floor(Math.random() * (b - a + 1));
}

var pillager1 = new Audio('https://static.wikia.nocookie.net/minecraft_gamepedia/images/5/50/Pillager_idle1.ogg/revision/latest?cb=20190501065714');
var pillager2 = new Audio('https://static.wikia.nocookie.net/minecraft_gamepedia/images/6/6b/Pillager_idle2.ogg/revision/latest?cb=20190501065725');
var pillager3 = new Audio('https://static.wikia.nocookie.net/minecraft_gamepedia/images/2/26/Pillager_idle3.ogg/revision/latest?cb=20190501065802');
var pillager4 = new Audio('https://static.wikia.nocookie.net/minecraft_gamepedia/images/8/8c/Pillager_idle4.ogg/revision/latest?cb=20181025011309');

var pillagerSounds = [[pillager1, pillager2, pillager3, pillager4]];

var loadA1 = new Audio('https://static.wikia.nocookie.net/minecraft_gamepedia/images/5/53/Crossbow_loading_start.ogg/revision/latest?cb=2019112219275');

var loadB1 = new Audio('https://static.wikia.nocookie.net/minecraft_gamepedia/images/e/e8/Crossbow_loading_middle1.ogg/revision/latest?cb=20191122193034');
var loadB2 = new Audio('https://static.wikia.nocookie.net/minecraft_gamepedia/images/c/c6/Crossbow_loading_middle2.ogg/revision/latest?cb=20191122193049');
var loadB3 = new Audio('https://static.wikia.nocookie.net/minecraft_gamepedia/images/7/7c/Crossbow_loading_middle3.ogg/revision/latest?cb=20191122193102');
var loadB4 = new Audio('https://static.wikia.nocookie.net/minecraft_gamepedia/images/1/18/Crossbow_loading_middle4.ogg/revision/latest?cb=20191122193116');

var fire1 = new Audio('https://static.wikia.nocookie.net/minecraft_gamepedia/images/c/c6/Crossbow_shoot1.ogg/revision/latest?cb=20181025050210');
var fire2 = new Audio('https://static.wikia.nocookie.net/minecraft_gamepedia/images/7/79/Crossbow_shoot2.ogg/revision/latest?cb=20191122193654');
var fire3 = new Audio('https://static.wikia.nocookie.net/minecraft_gamepedia/images/c/cb/Crossbow_shoot3.ogg/revision/latest?cb=20191122193709');

var hit1 = new Audio('https://static.wikia.nocookie.net/minecraft_gamepedia/images/f/f4/Arrow_hit1.ogg/revision/latest?cb=20191113164828');
var hit2 = new Audio('https://static.wikia.nocookie.net/minecraft_gamepedia/images/a/a2/Arrow_hit2.ogg/revision/latest?cb=20191113164844');
var hit3 = new Audio('https://static.wikia.nocookie.net/minecraft_gamepedia/images/3/33/Arrow_hit3.ogg/revision/latest?cb=20191113164858');
var hit4 = new Audio('https://static.wikia.nocookie.net/minecraft_gamepedia/images/e/e6/Arrow_hit4.ogg/revision/latest?cb=20191113164918');

var crossbowSounds = [[loadA1], [loadB1, loadB2, loadB3, loadB4], [fire1, fire2, fire3], [hit1, hit2, hit3, hit4]];

function playAt(sound, time, volumeFactor) {
  setTimeout(function() {
    sound.volume *= volumeFactor;
    sound.play();
    sound.volume /= volumeFactor;
  }, time * 1000);
}

function playAudio(sounds, volumeFactor) {
  var count = 0;
  for (var i = 0; i < sounds.length; ++i) {
    var sound = sounds[i][randint(0, sounds[i].length - 1)];
    playAt(sound, count, volumeFactor);
    count += sound.duration;
  }
}

window.onkeydown = function(e) {
  if (randint(0, 3) == 0) {
    playAudio(pillagerSounds, 1);
  }
  else {
    playAudio(pillagerSounds, 1 / 3);
  }
  playAudio(crossbowSounds, 1);
};
