'use strict';

const RATE = 1.5;
const FINGERS = 10;

const PITCHS = {
  'c=': -9,
  'c#': -8,
  'd=': -7,
  'e=': -5,
  'f=': -4,
  'f#': -3,
  'g=': -2,
  'a=': 0,
  'b-': 1,
  'b=': 2,
};

const DURATIONS = {
  '1': 1,
  '2': 1/2,
  '3.8': 3/8,
  '3': 1/3,
  '4': 1/4,
  '7.32': 7/32,
  '6': 1/6,
  '8': 1/8,
  '12': 1/12,
  '16': 1/16,
  '24': 1/24,
  '32': 1/32,
};

function Song(startTime, score) {
  var ctx = new AudioContext();
  var oscillators = [];
  var gains = [];
  var merger = ctx.createChannelMerger(FINGERS);
  for (var i = 0; i < FINGERS; i++) {
    var g = ctx.createGain();
    var o = ctx.createOscillator();
    o.type = 'square';
    o.connect(g);
    g.connect(merger, 0, i);
    gains.push(g);
    oscillators.push(o);
  }
  merger.connect(ctx.destination);
  var tm = startTime;
  function rawChord(keys, duration) {
    for (var i = 0; i < FINGERS; ++i) {
      if (i < keys.length) {
        oscillators[i].frequency.setValueAtTime(440 * Math.pow(2, keys[i] / 12), tm);
        gains[i].gain.setValueAtTime(1, tm);
      } else {
        gains[i].gain.setValueAtTime(0, tm);
      }
    }
    tm += duration * RATE;
  }

  function chord(keys, duration) {
    rawChord(keys, duration - (1/128 * RATE));
    rawChord([], (1/128 * RATE));
  }

  var signature = {
    'a': '=',
    'b': '=',
    'c': '=',
    'd': '=',
    'e': '=',
    'f': '=',
    'g': '=',
  };
  var keys = [];
  var octave = 0;
  for (var i = 0; i < score.length; ++i) {
    var code1 = score.substr(i, 1);
    var code2 = score.substr(i, 2);
    var code3 = score.substr(i, 3);
    var code4 = score.substr(i, 4);
    if (PITCHS[code2] !== undefined) {
      keys.push(octave * 12 + PITCHS[code2]);
      ++i;
    } else if (PITCHS[code1 + signature[code1]] !== undefined) {
      keys.push(octave * 12 + PITCHS[code1 + signature[code1]]);
    } else if (DURATIONS[code4] !== undefined) {
      chord(keys, DURATIONS[code4]);
      keys = [];
      i += 3;
    } else if (DURATIONS[code3] !== undefined) {
      chord(keys, DURATIONS[code3]);
      keys = [];
      i += 2;
    } else if (DURATIONS[code2] !== undefined) {
      chord(keys, DURATIONS[code2]);
      keys = [];
      ++i;
    } else if (DURATIONS[code1] !== undefined) {
      chord(keys, DURATIONS[code1]);
      keys = [];
    } else if (code1 == 'k') {
      signature[score[i + 1]] = score[i + 2];
      i += 2;
    } else if (code1 == '^') {
      ++octave;
    } else if (code1 == 'v') {
      --octave;
    }
  }

  chord([], 1); 
  return function() {
    for (var i = 0; i < FINGERS; ++i) {
      oscillators[i].start();
    }
  }
}

document.getElementById('play').onclick = function() {
  var now = new AudioContext().currentTime;
  var right = Song(now, `
  c24 e24 g24 ^c2 vg2
  ^e3.8 f16 d16 c4 r4
  g4 g4 r4 a4
  g32 f7.32 f4 r4 g4
  f32 e7.32 e4 r4 g8 e8
  c#8 d8 f8 e8 c#8 d8 f8 e8
  c#8 d8 f8 a8 g8 e8 f8 d8
  vc24 e24 g24 ^c2 vg2
  ^e3.8 f16 d16 c4 r4
  g4 g4 r4 a4
  g32 f7.32 f4 r8 f#8 a8 g8
  f32 e7.32 e4 r8 e8 g8 e8
  c#3.8 d16 e16 d4 r8 f8
  e3.8 f16 g16 f4 r4
  c^c8 vc^c8 vc^c2 vb8 a8
  cg8 cg8 cg2 f8 e8
  `);
  var left = Song(now, `
  r8 vvc^c2 vg2
  ^e3.8 f16 d16 c4 r4
  e8 g8 e8 g8 c#8 g8 c#8 g8
  d8 g8 d8 g8 vb8 ^g8 vb8 ^g8
  c8 g8 c8 g8 e8 g8 e8 g8
  fa1
  r4 fa^d4 vg^ce4 vgb^d4
  r8 vcvc2 g2
  ^e3.8 f16 d16 c4 r4
  e8 g8 e8 g8 c#8 g8 c#8 g8
  d8 g8 d8 g8 vb8 ^g8 vb8 ^g8
  c8 g8 c8 g8 e8 g8 e8 g8
  gb-2 fa4 r4
  gb-2 a^c4 r4
  a8 ^c8 va8 ^c8 vf8 ^c8 vf8 ^c8
  ve8 ^c8 ve8 ^c8 vc8 ^c8 vc8 ^c8
  `); 
  left();
  right();
};
