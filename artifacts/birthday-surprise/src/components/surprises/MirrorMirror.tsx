import { useState } from 'react';

const KF = `
@keyframes mirrorShine{0%,100%{transform:translateY(0) rotate(-3deg) scale(1)}50%{transform:translateY(-18px) rotate(4deg) scale(1.08)}}
@keyframes cardSlideIn{0%{opacity:0;transform:translateX(40px)}100%{opacity:1;transform:translateX(0)}}
@keyframes sparkle{0%,100%{opacity:0;transform:scale(.5)}50%{opacity:1;transform:scale(1.2)}}
@keyframes hintFade{0%,100%{opacity:.4}50%{opacity:.9}}
`;

const MIRRORS = [
  { q:"Mirror, mirror… who is kind?", a:"You are! 💕" },
  { q:"Mirror, mirror… who has the warmest smile?", a:"You do! ✨" },
  { q:"Mirror, mirror… who lights up a room?", a:"Definitely you! 🌟" },
  { q:"Mirror, mirror… who is someone special thinking of?", a:"You! Always you 💖" },
  { q:"Mirror, mirror… who deserves every happiness?", a:"You — without question 💝" },
];

const SPARKS = ['✨','💫','⭐','🌟','💎'];

interface P { message: string; onReveal?: () => void }

export default function MirrorMirror({ onReveal }: P) {
  const [step, setStep] = useState(0);
  const [showAns, setShowAns] = useState(false);
  const [done, setDone] = useState(false);

  const tap = () => {
    if (!showAns) { setShowAns(true); return; }
    if (step < MIRRORS.length - 1) { setStep(s=>s+1); setShowAns(false); }
    else setDone(true);
  };

  return (
    <div style={{
      position:'relative', width:'100%', height:'100%', overflow:'hidden',
      background:'linear-gradient(145deg,#1a1a4e 0%,#2d1b69 30%,#4a2c8c 60%,#1e0a3c 100%)',
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      gap:'clamp(12px,3vw,24px)',
    }}>
      <style>{KF}</style>

      {SPARKS.map((s,i) => (
        <div key={i} style={{
          position:'absolute',
          left:`${12+i*18}%`, top:`${8+i*12}%`,
          fontSize:'clamp(.8rem,2vw,1.2rem)',
          animation:`sparkle ${2+i*.4}s ${i*.3}s ease-in-out infinite`,
          pointerEvents:'none',
        }}>{s}</div>
      ))}

      <div
        onClick={() => onReveal?.()}
        style={{
          fontSize:'clamp(3.5rem,13vw,7rem)', cursor:'pointer', userSelect:'none',
          animation:'mirrorShine 3s ease-in-out infinite',
          filter:'drop-shadow(0 0 24px rgba(180,120,255,.6)) drop-shadow(0 0 48px rgba(120,80,200,.4))',
        }}
      >🪞</div>

      {!done ? (
        <div
          onClick={tap}
          style={{
            background:'rgba(255,255,255,.1)', backdropFilter:'blur(12px)',
            border:'1px solid rgba(200,150,255,.4)',
            borderRadius:20, padding:'clamp(16px,4vw,28px)',
            width:'min(380px,88%)', textAlign:'center', cursor:'pointer',
            minHeight:'clamp(140px,25vw,180px)',
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16,
            animation:'cardSlideIn .4s ease',
            key: step,
          } as any}
        >
          <p style={{
            color:'#c4b5fd', fontSize:'clamp(.85rem,2.5vw,1.1rem)',
            fontStyle:'italic', lineHeight:1.5,
          }}>{MIRRORS[step].q}</p>

          {showAns && (
            <p style={{
              fontSize:'clamp(1.2rem,4vw,2rem)', fontWeight:900, color:'white',
              textShadow:'0 0 20px rgba(200,150,255,.8)',
              animation:'cardSlideIn .35s ease',
            }}>{MIRRORS[step].a}</p>
          )}

          <p style={{
            color:'rgba(180,140,255,.6)', fontSize:'clamp(.6rem,1.6vw,.8rem)',
            animation:'hintFade 2s ease-in-out infinite',
          }}>
            {!showAns ? 'Tap to see the answer…' : step < MIRRORS.length-1 ? 'Tap for the next one →' : 'Tap to finish ✨'}
          </p>
        </div>
      ) : (
        <div style={{
          background:'rgba(255,255,255,.15)', backdropFilter:'blur(12px)',
          border:'1px solid rgba(200,150,255,.4)',
          borderRadius:20, padding:'clamp(16px,4vw,28px)',
          width:'min(380px,88%)', textAlign:'center',
        }}>
          <div style={{ fontSize:'clamp(2rem,8vw,4rem)', marginBottom:12 }}>🌟</div>
          <p style={{ color:'#c4b5fd', fontSize:'clamp(.8rem,2.2vw,1rem)', fontStyle:'italic', marginBottom:16 }}>
            And the mirror always knows…
          </p>
          <button
            onClick={() => onReveal?.()}
            style={{
              background:'rgba(200,150,255,.3)', color:'white',
              border:'1px solid rgba(200,150,255,.6)', borderRadius:20,
              padding:'10px 28px', cursor:'pointer', fontWeight:600,
              fontSize:'clamp(.75rem,2vw,.9rem)',
            }}
          >See today's message 💌</button>
        </div>
      )}

      <div style={{
        color:'rgba(180,140,255,.6)', fontSize:'clamp(.6rem,1.7vw,.8rem)',
        animation:'hintFade 2.5s ease-in-out infinite',
      }}>✦ {MIRRORS.length} mirror questions · tap 🪞 anytime for today's message ✦</div>
    </div>
  );
}
