/* ──────────────────────────────────────────────────────────────
   Singleton Web Audio API analyser.

   USAGE
     connectAudio(audioEl)  — call within / after a user gesture.
                              Safe to call multiple times: no-ops
                              if the same element is already wired.
     getAudioEnergy()       — returns normalised [0..1] energy.
                              Returns 0 until connected & running.
   ────────────────────────────────────────────────────────────── */

let audioCtx: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let dataArray: Uint8Array<ArrayBuffer> | null = null;
let currentSource: MediaElementAudioSourceNode | null = null;
const connectedEls = new WeakSet<HTMLAudioElement>();

export async function connectAudio(audioEl: HTMLAudioElement): Promise<void> {
  if (connectedEls.has(audioEl)) return;
  try {
    /* Create context on first call (must be within a user gesture) */
    if (!audioCtx) {
      audioCtx = new (window.AudioContext ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).webkitAudioContext)();
    }

    /* CRITICAL — resume BEFORE wiring the source; otherwise the
       AudioContext stays suspended and audio silently cuts out */
    if (audioCtx.state !== 'running') {
      await audioCtx.resume();
    }

    /* Build the analyser once */
    if (!analyser) {
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.80;
      analyser.connect(audioCtx.destination);
      dataArray = new Uint8Array(analyser.frequencyBinCount) as Uint8Array<ArrayBuffer>;
    }

    /* Disconnect previous source node if any */
    if (currentSource) {
      try { currentSource.disconnect(); } catch { /* ok */ }
    }

    /* Route audio element → analyser → speakers */
    currentSource = audioCtx.createMediaElementSource(audioEl);
    currentSource.connect(analyser);
    connectedEls.add(audioEl);

  } catch (e) {
    console.warn('[audioReact] connect failed:', e);
  }
}

export function getAudioEnergy(): number {
  if (!analyser || !dataArray || !audioCtx) return 0;
  if (audioCtx.state !== 'running') return 0;
  analyser.getByteFrequencyData(dataArray);
  let sum = 0;
  /* Bass + low-mid gives best "beat feel" */
  const len = Math.floor(dataArray.length * 0.45);
  for (let i = 0; i < len; i++) sum += dataArray[i];
  return Math.min(1, (sum / len) / 85);
}

export function isConnected(): boolean {
  return currentSource !== null;
}
