/** Web Audio API synthesizer for Sun Rail sound effects. */

let audioCtx: AudioContext | null = null;
let ambientNode: OscillatorNode | null = null;
let ambientGain: GainNode | null = null;
let initialized = false;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

/** Resume audio context (must be called from user gesture). */
export function resumeAudio() {
  const ctx = getCtx();
  if (ctx.state === "suspended") {
    ctx.resume();
  }
}

/** Initialize audio — call once on first user interaction. */
export function initAudio() {
  if (initialized) return;
  initialized = true;
  resumeAudio();
  startAmbient();
}

/** Low ambient space drone — continuous loop. */
function startAmbient() {
  const ctx = getCtx();

  // Deep bass drone
  ambientNode = ctx.createOscillator();
  ambientGain = ctx.createGain();

  ambientNode.type = "sine";
  ambientNode.frequency.value = 40;
  ambientGain.gain.value = 0.03;

  // Add subtle modulation
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.type = "sine";
  lfo.frequency.value = 0.1;
  lfoGain.gain.value = 5;
  lfo.connect(lfoGain);
  lfoGain.connect(ambientNode.frequency);
  lfo.start();

  ambientNode.connect(ambientGain);
  ambientGain.connect(ctx.destination);
  ambientNode.start();
}

/** Launch whoosh — rising tone with noise burst. */
export function playLaunch() {
  const ctx = getCtx();
  const now = ctx.currentTime;

  // Rising tone
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(100, now);
  osc.frequency.exponentialRampToValueAtTime(800, now + 0.4);
  gain.gain.setValueAtTime(0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.6);

  // Noise burst
  const bufferSize = ctx.sampleRate * 0.3;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
  }
  const noise = ctx.createBufferSource();
  const noiseGain = ctx.createGain();
  noise.buffer = buffer;
  noiseGain.gain.setValueAtTime(0.05, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
  noise.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noise.start(now);
}

/** Arrival chime — pleasant ascending tones. */
export function playArrival() {
  const ctx = getCtx();
  const now = ctx.currentTime;

  const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, now + i * 0.15);
    gain.gain.linearRampToValueAtTime(0.06, now + i * 0.15 + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.8);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + i * 0.15);
    osc.stop(now + i * 0.15 + 0.8);
  });
}

/** UI click — short blip. */
export function playClick() {
  const ctx = getCtx();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = 1200;
  gain.gain.setValueAtTime(0.04, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.08);
}
