let audioContext;
let enabled = false;

function context() {
  audioContext ??= new AudioContext();
  if (audioContext.state === 'suspended') audioContext.resume();
  return audioContext;
}

function tone(frequency, duration = 0.12, type = 'square') {
  if (!enabled) return;
  const audio = context();
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.035, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duration);
  oscillator.connect(gain);
  gain.connect(audio.destination);
  oscillator.start();
  oscillator.stop(audio.currentTime + duration);
}

export function setSoundEnabled(value) {
  enabled = value;
  if (enabled) {
    tone(520, 0.08);
  } else if (audioContext) {
    audioContext.suspend();
  }
}

export function playActionSound(action) {
  const patterns = {
    attack: [180, 90],
    boss: [120, 70],
    special: [440, 660, 880],
    powerup: [330, 520, 740],
    blocked: [110, 110],
    select: [660, 820],
    victory: [523, 659, 784, 1046],
    achievement: [784, 988, 1174, 1568]
  };
  (patterns[action] || [300]).forEach((frequency, index) => setTimeout(() => tone(frequency, 0.1), index * 80));
}

export function playAchievementSound() {
  playActionSound('achievement');
}

export function playMusic(moment) {
  const melodies = {
    start: [262, 330, 392, 523],
    end: [523, 659, 784, 1046, 784, 1046]
  };
  (melodies[moment] || []).forEach((frequency, index) => setTimeout(() => tone(frequency, 0.22, 'triangle'), index * 170));
}

export function playDebugAudio() {
  playMusic('start');
  setTimeout(() => playActionSound('achievement'), 800);
  setTimeout(() => playActionSound('attack'), 1500);
  setTimeout(() => playMusic('end'), 2200);
}
