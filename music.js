'use strict';

const RATE = 2.5;
const FINGERS = 6;

const PITCHS = {
  'c=': -9,
  'c#': -8,
  'd-': -8,
  'd=': -7,
  'd#': -6,
  'e-': -6,
  'e=': -5,
  'f=': -4,
  'f#': -3,
  'g-': -3,
  'g=': -2,
  'g#': -1,
  'a-': -1,
  'a=': 0,
  'a#': 1,
  'b-': 1,
  'b=': 2,
};

const DURATIONS = {
  '1': 1,
  '9.16': 9/16,
  '2': 1/2,
  '3.8': 3/8,
  '3': 1/3,
  '5.16': 5/16,
  '4': 1/4,
  '7.32': 7/32,
  '3.16': 3/16,
  '6': 1/6,
  '9.64': 9/64,
  '3.32': 3/32,
  '8': 1/8,
  '12': 1/12,
  '16': 1/16,
  '3.64': 3/64,
  '24': 1/24,
  '32': 1/32,
  '3.128': 3/128,
  '48': 1/48,
  '64': 1/64,
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
    var gap = RATE / 128;
    if (duration < 1 / 32) {
      gap = duration * 1 / 8;
    }
    rawChord(keys, duration - gap);
    rawChord([], gap);
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

document.getElementById('play_mozart').onclick = function() {
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

document.getElementById('play_bach_invention_1').onclick = function() {
  var now = new AudioContext().currentTime;
  var voice_bottom = Song(now, `
  r2 r16 vc16 d16 e16 f16 d16 e16 c16
  g8 vg8 r4 r16 ^g16 a16 b16 ^c16 va16 b16 g16
  ^c8 vb8 ^c8 d8 e8 vg8 a8 b8
  ^c8 ve8 f#8 g8 a8 b8 ^c5.16
  vd16 e16 f#16 g16 e16 f#16 d16 g8 vb8 ^c8 d8
  e8 f#8 g8 e8 vb3.16 ^c16 d8 vd8
  r16 g16 a16 b16 ^c16 va16 b16 g16 ^d8 g8 f#8 g8
  a16 d16 e16 f#16 g16 e16 f#16 d16 a8 ^d8 c8 d8
  vg16 ^g16 f16 e16 d16 f16 e16 g16 f8 e8 f8 d8
  e16 a16 g16 f16 e16 g16 f16 a16 g8 f8 g8 e8
  f16 b-16 a16 g16 f16 a16 g16 b-16 a16 g16 f16 e16 d16 f16 e16 g16
  f16 e16 d16 c16 vb16 ^d16 c16 e16 d16 c16 vb16 a16 g#16 b16 a16 ^c16
  vb8 e8 ^d3.128 c3.128 d9.64 e16 c16 vb16 a16 g16 f#16 a16 g#16 b16
  a16 ^c16 vb16 ^d16 c16 e16 d16 f16 e8 va8 ^e8 ve8
  a8 va8 r4 r16 ^^e16 d16 c16 vb16 ^d16 c#16 e16
  d9.16 va16 b16 ^c16 d16 vb16 c16 a16
  b9.16 ^d16 c16 vb16 a16 ^c16 vb16 ^d16
  c9.16 vg16 a16 b-16 ^c16 va16 b-16 g16
  a8 b-8 a8 g8 f8 ^d8 c8 vb-8
  a8 ^f8 e8 d8 e16 vd16 e16 f16 g16 e16 f16 d16
  e8 c8 d8 e8 f16 d16 e16 f16 g8 vg8
  c1
  `);
  var voice_top = Song(now, `
  r16 c16 d16 e16 f16 d16 e16 c16 g8 ^c8 c64 vb64 ^c64 vb64 ^c64 vb3.64 ^c8
  d16 vg16 a16 b16 ^c16 va16 b16 g16 ^d8 g8 g64 f64 g64 f64 g64 f3.64 g8
  e16 a16 g16 f16 e16 g16 f16 a16 g16 f16 e16 d16 c16 e16 d16 f16
  e16 d16 c16 vb16 a16 ^c16 vb16 ^d16 c16 vb16 a16 g16 f#16 a16 g16 b16
  a8 d8 ^c3.128 vb3.128 ^c9.64 d16 vb16 a16 g16 f#16 e16 g16 f#16 a16
  g16 b16 a16 ^c16 vb16 ^d16 c16 e16 d16 vb32 ^c32 d16 g16 vb8 a16 g16
  g8 r8 r4 r16 g16 a16 b16 ^c16 va16 b16 g16
  f#8 r8 r4 r16 a16 b16 ^c16 d16 vb16 ^c16 va16
  b8 r8 r4 r16 ^d16 c16 vb16 a16 ^c16 vb16 ^d16
  c8 r8 r4 r16 e16 d16 c16 vb16 ^d16 c#16 e16
  d8 c#8 d8 e8 f8 va8 b8 ^c#8
  d8 vf#8 g#8 a8 b8 ^c8 d5.16
  ve16 f#16 g#16 a16 f#16 g#16 e16 ^e16 d16 c16 e16 d16 c16 vb16 ^d16
  c16 a16 g#16 b16 a16 e16 f16 d16 vg#16 ^f16 e16 d16 c8 vb16 a16
  a16 ^a16 g16 f16 e16 g16 f16 a16 g9.16
  e16 f16 g16 a16 f16 g16 e16 f9.16
  g16 f16 e16 d16 f16 e16 g16 f9.16
  d16 e16 f16 g16 e16 f16 d16 e9.16
  c16 d16 e16 f16 d16 e16 c16 d16 e16 f16 g16 a16 f16 g16 e16
  f16 g16 a16 b16 ^c16 va16 b16 g16 ^c8 vg8 e8 d16 c16
  c16 vb-16 a16 g16 f16 a16 g16 b16 a16 b16 ^c16 ve16 d16 ^c16 vf16 b16
  eg^c1
  `);
  voice_bottom();
  voice_top();
}
