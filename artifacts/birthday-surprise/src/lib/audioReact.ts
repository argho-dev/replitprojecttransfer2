/* ──────────────────────────────────────────────────────────────
   Singleton Web Audio API analyzer.
   Call connectAudio(el) after user gesture to hook into the
   <audio> element.  Call getAudioEnergy() any time to read
   a normalized [0..1] energy value.
   ────────────────────────────────────────────────────────────── */

let audioCtx: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let dataArray: Uint8Array | null = null;
let currentSource: MediaElementAudioSourceNode | null = null;
const connectedEls = new WeakSet<HTMLAudioElement>();

export function connectAudio(audioEl: HTMLAudioElement): void {
  if (connectedEls.has(audioEl)) return;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.85;
      analyser.connect(audioCtx.destination);
      dataArray = new Uint8Array(analyser.frequencyBinCount);
    }
    if (currentSource) {
      try { currentSource.disconnect(); } catch { /* ok */ }
    }
    currentSource = audioCtx.createMediaElementSource(audioEl);
    currentSource.connect(analyser!);
    connectedEls.add(audioEl);
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
  } catch (e) {
    console.warn('[audioReact] connect failed:', e);
  }
}

export function getAudioEnergy(): number {
  if (!analyser || !dataArray || !audioCtx) return 0;
  if (audioCtx.state !== 'running') return 0;
  analyser.getByteFrequencyData(dataArray);
  let sum = 0;
  const len = Math.floor(dataArray.length * 0.45);
  for (let i = 0; i < len; i++) sum += dataArray[i];
  return Math.min(1, (sum / len) / 90);
}
