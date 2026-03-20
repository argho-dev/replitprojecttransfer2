import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';

const KF = `
@keyframes envelopeBob{0%,100%{transform:translateY(0) rotate(-3deg) scale(1)}50%{transform:translateY(-18px) rotate(4deg) scale(1.06)}}
@keyframes petalDrift{0%{transform:translateY(-30px) rotate(0deg);opacity:0}8%{opacity:1}92%{opacity:.8}100%{transform:translateY(110vh) rotate(var(--rot));opacity:0}}
@keyframes hintFade{0%,100%{opacity:.45}50%{opacity:1}}
`;

const PETALS = Array.from({ length: 18 }, (_, i) => ({
  left: `${(i * 5.6) % 96}%`,
  dur: 5 + (i % 5) * 1.3,
  delay: -(i * 0.6),
  rot: `${(i % 2 ? 1 : -1) * (180 + i * 30)}deg`,
}));

interface P { message: string; onReveal?: () => void }

export default function LoveLetter({ message, onReveal }: P) {
  const [opened, setOpened] = useState(false);
  const envelopeRef = useRef<HTMLDivElement>(null);
  const letterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (letterRef.current) gsap.set(letterRef.current, { opacity:0, scale:.7, y:60, pointerEvents:'none' });
  }, []);

  const open = (e: React.MouseEvent) => {
    if (opened) return;
    setOpened(true);
    const env = envelopeRef.current, ltr = letterRef.current;
    if (!env || !ltr) return;
    gsap.timeline()
      .to(env, { scale:1.12, rotation:8, duration:.18, ease:'power1.out' })
      .to(env, { scale:.85, rotation:-5, duration:.13 })
      .to(env, { scale:0, opacity:0, rotation:15, y:-30, duration:.35, ease:'back.in(1.4)',
        onComplete: () => {
          gsap.set(ltr, { pointerEvents:'auto' });
          gsap.fromTo(ltr,
            { opacity:0, scale:.6, y:60, rotation:-8 },
            { opacity:1, scale:1, y:0, rotation:0, duration:.75, ease:'back.out(1.7)' }
          );
        }
      });
  };

  const close = () => {
    const ltr = letterRef.current;
    if (!ltr) return;
    gsap.to(ltr, { opacity:0, scale:.7, y:40, duration:.4, ease:'back.in(1.4)',
      onComplete: () => {
        setOpened(false);
        gsap.set(ltr, { pointerEvents:'none' });
        if (envelopeRef.current)
          gsap.fromTo(envelopeRef.current, { opacity:0, scale:.5 }, { opacity:1, scale:1, duration:.5, ease:'back.out(1.7)' });
      }
    });
  };

  return (
    <div style={{
      position:'relative', width:'100%', height:'100%', overflow:'hidden',
      background:'linear-gradient(155deg,#fbcfe8 0%,#fce7f3 35%,#f5d0fe 65%,#ede9fe 100%)',
      display:'flex', alignItems:'center', justifyContent:'center',
    }}>
      <style>{KF}</style>

      {PETALS.map((p,i) => (
        <div key={i} style={{
          position:'absolute', left:p.left, top:0,
          fontSize:'1rem', userSelect:'none', pointerEvents:'none',
          ['--rot' as any]: p.rot,
          animation:`petalDrift ${p.dur}s ${p.delay}s linear infinite`,
        }}>🌸</div>
      ))}

      {/* Envelope */}
      <div
        ref={envelopeRef}
        onClick={open}
        style={{
          display:'flex', flexDirection:'column', alignItems:'center',
          gap:'clamp(12px,3vw,22px)', cursor: opened ? 'default' : 'pointer',
          position:'relative', zIndex:10,
        }}
      >
        <p style={{ color:'#9d4b7a', fontSize:'clamp(.85rem,2.5vw,1.1rem)', fontStyle:'italic', opacity:.8, animation:'hintFade 2s ease-in-out infinite' }}>
          Something is waiting for you…
        </p>
        <div style={{ animation:'envelopeBob 3s ease-in-out infinite', filter:'drop-shadow(0 4px 20px rgba(200,80,150,.35))' }}>
          <svg width="clamp(180px,45vw,260px)" height="clamp(130px,33vw,190px)" viewBox="0 0 260 190" fill="none">
            <rect x="10" y="60" width="240" height="120" rx="12" fill="rgba(255,121,198,.15)" stroke="#ff79c6" strokeWidth="2"/>
            <path d="M10 60 L130 125 L250 60" fill="rgba(255,121,198,.1)" stroke="#ff79c6" strokeWidth="2"/>
            <path d="M10 180 L95 118" stroke="#ff79c6" strokeWidth="1.5" opacity=".4"/>
            <path d="M250 180 L165 118" stroke="#ff79c6" strokeWidth="1.5" opacity=".4"/>
            <circle cx="130" cy="85" r="16" fill="rgba(255,45,120,.2)" stroke="#ff2d78" strokeWidth="1.5"/>
            <path d="M130 80 C128 77 123 77 123 82 C123 87 130 93 130 93 C130 93 137 87 137 82 C137 77 132 77 130 80 Z" fill="#ff2d78"/>
          </svg>
        </div>
        <div style={{ textAlign:'center' }}>
          <p style={{ color:'#c2185b', fontWeight:700, fontSize:'clamp(.9rem,2.5vw,1.15rem)' }}>Tap to open 💌</p>
          <p style={{ color:'rgba(150,50,100,.5)', fontSize:'clamp(.6rem,1.6vw,.8rem)', marginTop:4 }}>A letter just for you</p>
        </div>
      </div>

      {/* Letter (always in DOM) */}
      <div
        ref={letterRef}
        style={{
          position:'absolute', inset:'auto',
          width:'min(420px,92vw)',
          background:'rgba(255,255,255,.88)', backdropFilter:'blur(16px)',
          border:'1px solid rgba(255,121,198,.4)', borderRadius:20,
          padding:'clamp(20px,5vw,32px)', zIndex:20, pointerEvents:'none',
          boxShadow:'0 8px 48px rgba(200,80,150,.25)',
        }}
      >
        <button onClick={close} style={{
          position:'absolute', top:12, right:16,
          background:'none', border:'none', cursor:'pointer',
          color:'#ff79c6', fontSize:'1.2rem', opacity:.7, lineHeight:1,
        }}>✕</button>

        <div style={{ textAlign:'center', marginBottom:'clamp(12px,3vw,20px)' }}>
          <div style={{ fontSize:'clamp(2rem,7vw,3.2rem)', lineHeight:1, marginBottom:8 }}>💌</div>
          <div style={{ fontWeight:700, fontSize:'clamp(1rem,3vw,1.3rem)', color:'#c2185b' }}>For You 💖</div>
        </div>

        <div style={{ color:'#4a1030', lineHeight:1.75, fontSize:'clamp(.8rem,2.2vw,1rem)' }}>
          <p style={{ fontStyle:'italic', opacity:.65, marginBottom:10 }}>Dear you,</p>
          <p style={{ fontWeight:300, marginBottom:12 }}>"{message}"</p>
          <p style={{ opacity:.6, fontSize:'clamp(.72rem,1.9vw,.9rem)', marginBottom:8 }}>
            There are feelings that words can barely carry — this is one of them. But I tried anyway, because you deserve to know.
          </p>
          <p style={{ opacity:.6, fontSize:'clamp(.72rem,1.9vw,.9rem)' }}>
            Wishing you all the warmth and joy in the world, every single day.
          </p>
          <p style={{ textAlign:'right', marginTop:16, fontStyle:'italic', color:'#c2185b', fontSize:'clamp(.75rem,2vw,.9rem)' }}>
            With love ❤️
          </p>
        </div>

        <div style={{ marginTop:16, textAlign:'center', fontSize:'clamp(1.2rem,4vw,1.8rem)' }}>💕 💖 💗</div>

        <div style={{ textAlign:'center', marginTop:14 }}>
          <button
            onClick={() => onReveal?.()}
            style={{
              background:'linear-gradient(135deg,#ff79c6,#c2185b)', color:'white',
              border:'none', borderRadius:20, padding:'8px 24px',
              cursor:'pointer', fontWeight:600, fontSize:'clamp(.7rem,1.8vw,.85rem)',
            }}
          >Today's Message 💌</button>
        </div>
      </div>
    </div>
  );
}
