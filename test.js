'use strict';

function randint(a, b) {
  return a + Math.floor(Math.random() * (b - a + 1));
}

var pillager1 = new Audio('https://mathpig.github.io/minecraftsounds/sounds/Pillage_idle1.ogg');
var pillager2 = new Audio('https://mathpig.github.io/minecraftsounds/sounds/Pillage_idle2.ogg');
var pillager3 = new Audio('https://mathpig.github.io/minecraftsounds/sounds/Pillage_idle3.ogg');
var pillager4 = new Audio('https://mathpig.github.io/minecraftsounds/sounds/Pillage_idle4.ogg');

var pillagerSounds = [[pillager1, pillager2, pillager3, pillager4]];

var loadA1 = new Audio('https://mathpig.github.io/minecraftsounds/sounds/Crossbow_loading_start.ogg');

var loadB1 = new Audio('https://mathpig.github.io/minecraftsounds/sounds/Crossbow_loading_middle1.ogg');
var loadB2 = new Audio('https://mathpig.github.io/minecraftsounds/sounds/Crossbow_loading_middle2.ogg');
var loadB3 = new Audio('https://mathpig.github.io/minecraftsounds/sounds/Crossbow_loading_middle3.ogg');
var loadB4 = new Audio('https://mathpig.github.io/minecraftsounds/sounds/Crossbow_loading_middle4.ogg');

var fire1 = new Audio('https://mathpig.github.io/minecraftsounds/sounds/Crossbow_shoot1.ogg');
var fire2 = new Audio('https://mathpig.github.io/minecraftsounds/sounds/Crossbow_shoot2.ogg');
var fire3 = new Audio('https://mathpig.github.io/minecraftsounds/sounds/Crossbow_shoot3.ogg');

var hit1 = new Audio('https://mathpig.github.io/minecraftsounds/sounds/Arrow_hit1.ogg');
var hit2 = new Audio('https://mathpig.github.io/minecraftsounds/sounds/Arrow_hit2.ogg');
var hit3 = new Audio('https://mathpig.github.io/minecraftsounds/sounds/Arrow_hit3.ogg');
var hit4 = new Audio('https://mathpig.github.io/minecraftsounds/sounds/Arrow_hit4.ogg');

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
