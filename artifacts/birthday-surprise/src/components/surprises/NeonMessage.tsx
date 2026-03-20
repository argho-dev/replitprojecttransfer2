import { useState, useEffect, useRef } from 'react';

const KF = `
@keyframes neonSlide{0%{opacity:0;transform:translateY(20px) scale(.9)}100%{opacity:1;transform:translateY(0) scale(1)}}
@keyframes ringOrbit{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes heartPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.18)}}
@keyframes bgShimmer{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
@keyframes hintFade{0%,100%{opacity:.4}50%{opacity:.9}}
`;

const LINES = [
  "You are enough 💫","You are loved 💕","You are magic ✨",
  "You are seen 🌟","You are rare 💎","You matter 💖",
];

interface P { message: string; onReveal?: () => void }

export default function NeonMessage({ onReveal }: P) {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const orbitEmojis = ['💕','💖','✨','🌸','💝','🌟','💗','🦋'];

  useEffect(() => {
    const iv = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setIdx(i => (i+1)%LINES.length); setVisible(true); }, 350);
    }, 2600);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{
      position:'relative', width:'100%', height:'100%', overflow:'hidden',
      background:'linear-gradient(135deg,#f43f5e 0%,#ec4899 30%,#a855f7 65%,#6366f1 100%)',
      backgroundSize:'300% 300%',
      animation:'bgShimmer 8s ease-in-out infinite',
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      gap:'clamp(16px,4vw,32px)',
    }}>
      <style>{KF}</style>

      {/* Rotating neon text */}
      <div style={{
        fontSize:'clamp(1.8rem,6vw,4rem)', fontWeight:900, color:'white', textAlign:'center',
        lineHeight:1.2, letterSpacing:'-.01em', padding:'0 clamp(12px,3vw,24px)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition:'opacity .35s ease, transform .35s ease',
        textShadow:'0 0 24px rgba(255,255,255,.6)',
        fontFamily:'Georgia,serif',
      }}>
        {LINES[idx]}
      </div>

      {/* Orbital ring with clickable center */}
      <div style={{ position:'relative', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{
          position:'absolute',
          width:'clamp(120px,28vw,180px)', height:'clamp(120px,28vw,180px)',
          animation:'ringOrbit 12s linear infinite', pointerEvents:'none',
        }}>
          {orbitEmojis.map((e,i) => {
            const ang = (i/orbitEmojis.length)*360;
            return (
              <div key={i} style={{
                position:'absolute', left:'50%', top:'50%',
                transform:`rotate(${ang}deg) translateX(calc(clamp(55px,13vw,85px))) rotate(-${ang}deg)`,
                fontSize:'clamp(.9rem,2.5vw,1.3rem)',
                marginLeft:'-.65em', marginTop:'-.65em',
              }}>{e}</div>
            );
          })}
        </div>
        <div
          onClick={() => onReveal?.()}
          style={{
            fontSize:'clamp(2.5rem,9vw,5rem)', cursor:'pointer', userSelect:'none',
            animation:'heartPulse 1.8s ease-in-out infinite',
            filter:'drop-shadow(0 0 20px rgba(255,255,255,.7))',
            position:'relative', zIndex:5,
          }}
        >💖</div>
      </div>

      <div style={{
        color:'rgba(255,240,255,.8)', fontSize:'clamp(.65rem,1.8vw,.85rem)',
        animation:'hintFade 2.5s ease-in-out infinite', fontWeight:500,
      }}>✦ tap the heart for today's message ✦</div>
    </div>
  );
}
