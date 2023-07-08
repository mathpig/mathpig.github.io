'use strict';

function randint(a, b) {
  return a + Math.floor(Math.random() * (b - a + 1));
}

var hurt1 = new Audio('https://mathpig.github.io/minecraftsounds/sounds/Player_hurt1.ogg');
var hurt2 = new Audio('https://mathpig.github.io/minecraftsounds/sounds/Player_hurt2.ogg');
var hurt3 = new Audio('https://mathpig.github.io/minecraftsounds/sounds/Player_hurt3.ogg');

var pillager1 = new Audio('https://mathpig.github.io/minecraftsounds/sounds/Pillager_idle1.ogg');
var pillager2 = new Audio('https://mathpig.github.io/minecraftsounds/sounds/Pillager_idle2.ogg');
var pillager3 = new Audio('https://mathpig.github.io/minecraftsounds/sounds/Pillager_idle3.ogg');
var pillager4 = new Audio('https://mathpig.github.io/minecraftsounds/sounds/Pillager_idle4.ogg');

var pillagerSounds = [[[pillager1, pillager2, pillager3, pillager4]]];

var vindicator1 = new Audio('https://mathpig.github.io/minecraftsounds/sounds/Vindicator_idle1.ogg');
var vindicator2 = new Audio('https://mathpig.github.io/minecraftsounds/sounds/Vindicator_idle2.ogg');
var vindicator3 = new Audio('https://mathpig.github.io/minecraftsounds/sounds/Vindicator_idle3.ogg');
var vindicator4 = new Audio('https://mathpig.github.io/minecraftsounds/sounds/Vindicator_idle4.ogg');
var vindicator5 = new Audio('https://mathpig.github.io/minecraftsounds/sounds/Vindicator_idle5.ogg');

var vindicatorSounds = [[[vindicator1, vindicator2, vindicator3, vindicator4, vindicator5], [hurt1, hurt2, hurt3]]];

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

var crossbowSounds = [[[loadA1]], [[loadB1, loadB2, loadB3, loadB4]], [[fire1, fire2, fire3]], [[hit1, hit2, hit3, hit4], [hurt1, hurt2, hurt3]]];

var doorHit1 = new Audio('https://mathpig.github.io/minecraftsounds/sounds/Zombie_hit_wood1.ogg');
var doorHit2 = new Audio('https://mathpig.github.io/minecraftsounds/sounds/Zombie_hit_wood2.ogg');
var doorHit3 = new Audio('https://mathpig.github.io/minecraftsounds/sounds/Zombie_hit_wood3.ogg');
var doorHit4 = new Audio('https://mathpig.github.io/minecraftsounds/sounds/Zombie_hit_wood4.ogg');

var doorBreak = new Audio('https://mathpig.github.io/minecraftsounds/sounds/Zombie_breaks_door.ogg');

var doorHitSounds = [doorHit1, doorHit2, doorHit3, doorHit4];

var doorSounds = [];
for (var i = 0; i < 10; ++i) {
  doorSounds.push([doorHitSounds]);
}
doorSounds.push([[doorBreak]]);

var pigstep = new Audio('https://mathpig.github.io/minecraftsounds/sounds/Pigstep.ogg');

function playAt(sound, time, volumeFactor) {
  setTimeout(function() {
    sound.volume = volumeFactor;
    sound.play();
  }, time * 1000);
}

function playAudio(sounds, volumes) {
  var count = 0;
  for (var i = 0; i < sounds.length; ++i) {
    for (var j = 0; j < sounds[i].length; ++j) {
      var longestDuration = 0;
      for (var k = 0; k < sounds[i][j].length; ++k) {
        var sound = sounds[i][j][k][randint(0, sounds[i][j][k].length - 1)];
        playAt(sound, count, volumes[i][j][k]);
        longestDuration = Math.max(longestDuration, sound.duration);
      }
      count += longestDuration;
    }
  }
}

var doorVolumes = [];
for (var i = 0; i < 11; ++i) {
  doorVolumes.push([1]);
}

window.onkeydown = function(e) {
  var val = randint(0, 10);
  if (val <= 4) {
    var pillagerVolume = 1 / 3;
    if (randint(0, 2) == 0) {
      pillagerVolume = 1;
    }
    playAudio([pillagerSounds, crossbowSounds], [[[pillagerVolume]], [[1], [1], [1], [1, 1]]]);
  }
  else if (val <= 9) {
    var vindicatorVolume = 1 / 3;
    if (randint(0, 2) == 0) {
      vindicatorVolume = 1;
    }
    playAudio([doorSounds, vindicatorSounds], [doorVolumes, [[vindicatorVolume, 1]]]);
  }
  else {
    playAudio([[[[pigstep]]]], [[[1]]]);
  }
};
