'use strict';

class SoundBox {
  constructor() {
    this.contexts = [];
  }

  jump() {
    this.waveEffect(1, 0.3, 0.03, 0.05, 0.2, 'square', 220, 110, 220, 440);
  }
  
  laser() {
    this.waveEffect(1, 0.3, 0.03, 0.05, 0.2, 'square', 6400, 1600, 400, 100);
  }

  hurt() {
    this.waveEffect(1, 0.7, 0.03, 0.05, 0.2, 'sawtooth', 220, 220, 440, 220);
  }

  bomb() {
    this.waveEffect(1, 0.57, 0.53, 0.55, 0.7, 'square', 1600, 800, 400, 200);
  }

  hiss() {
    this.noiseEffect(1, 0.3, 0.03, 0.05, 0.2, 'lowpass', 1000000, 0, 0);
  }

  blast() {
    this.noiseEffect(5, 1, 0.03, 0, 1, 'lowpass', 220, 0, 0);
  }

  gun() {
    this.noiseEffect(1, 0.7, 0.03, 0.05, 0.2, 'bandpass', 220, 0.5, 0);
  }

  flute(n) {
    var freq = Math.pow(2, n / 12) * 220;
    this.waveEffect(1, 0.6, 0.03, 0.3, 0.05, 'sine', freq, freq * 1.01, freq, freq);
  }
  
  hop() {
    this.waveEffect(0.3, 0.2, 0.01, 0.01, 0.02, 'square', 110, 110, 110, 110);
  }
  
  newContext() {
    while (this.contexts < 40) {
      var c = new AudioContext();
      this.contexts.push(c);
      return c;
    }
    var c = this.contexts[0];
    this.contexts.slice(0, 1);
    this.contexts.push(c);
    return c;
  }

  waveEffect(attackVol, midVol, attackTime, midTime, decayTime, wave, startFreq, peakFreq, midFreq, endFreq) {
    var ctx = this.newContext();
    var oscillator = ctx.createOscillator();
    oscillator.type = wave;
    oscillator.frequency.setValueAtTime(startFreq, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(peakFreq, ctx.currentTime + attackTime);
    oscillator.frequency.exponentialRampToValueAtTime(midFreq, ctx.currentTime + attackTime + midTime);
    oscillator.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + attackTime + midTime + decayTime);
    var gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(attackVol, ctx.currentTime + attackTime);
    gainNode.gain.linearRampToValueAtTime(midVol, ctx.currentTime + attackTime + midTime);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + attackTime + midTime + decayTime);
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.start();
  }

  whitenoise(ctx) {
    var bufferSize = 256;
    var whiteNoise = ctx.createScriptProcessor(bufferSize, 1, 1);
    whiteNoise.onaudioprocess = function(e) {
      var output = e.outputBuffer.getChannelData(0);
      for (var i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
    }
    return whiteNoise;
  }

  noiseEffect(attackVol, midVol, attackTime, midTime, decayTime, filterType, freq, q, gain) {
    var ctx = this.newContext();
    var whiteNoise = this.whitenoise(ctx);
    var gainNode = ctx.createGain();
    var filter = ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.setValueAtTime(freq, ctx.currentTime);
    filter.Q.setValueAtTime(q, ctx.currentTime);
    filter.gain.setValueAtTime(gain, ctx.currentTime);
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(attackVol, ctx.currentTime + attackTime);
    gainNode.gain.linearRampToValueAtTime(midVol, ctx.currentTime + attackTime + midTime);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + attackTime + midTime + decayTime);
    whiteNoise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
  }
}
