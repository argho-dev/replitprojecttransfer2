import { useState } from 'react';

const KF = `
@keyframes twinkle{0%,100%{opacity:.4;transform:scale(.8)}50%{opacity:1;transform:scale(1.2)}}
@keyframes starBob{0%,100%{transform:translateY(0) scale(1) rotate(-3deg)}50%{transform:translateY(-22px) scale(1.1) rotate(5deg)}}
@keyframes hintFade{0%,100%{opacity:.4}50%{opacity:.9}}
@keyframes popIn{0%{opacity:0;transform:scale(.4)}100%{opacity:1;transform:scale(1)}}
`;

const WORDS = ['Kind','Warm','Bright','Real','Rare','Pure','Strong','Magic','Light','Heart','Loved','Special'];

interface P { message: string; onReveal?: () => void }

export default function StarConstellation({ onReveal }: P) {
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  const stars = WORDS.map((label, i) => ({
    label,
    left: `${6 + ((i * 8.2 + Math.sin(i * 1.3) * 15) % 82)}%`,
    top: `${10 + ((i * 7.5 + Math.cos(i * 1.6) * 18) % 72)}%`,
    dur: 1.8 + (i % 5) * 0.4,
    delay: i * 0.18,
    color: ['#ffe066','#ff79c6','#8be9fd','#bd93f9','#50fa7b','#ffb86c'][i%6],
  }));

  return (
    <div style={{
      position:'relative', width:'100%', height:'100%', overflow:'hidden',
      background:'linear-gradient(150deg,#0a0020 0%,#12004a 30%,#001a6e 65%,#000d3a 100%)',
      display:'flex', flexDirection:'column', alignItems:'center',
    }}>
      <style>{KF}</style>

      {/* central star character */}
      <div style={{ zIndex:10, textAlign:'center', marginTop:'clamp(16px,4vw,28px)', display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
        <div
          onClick={() => onReveal?.()}
          style={{
            fontSize:'clamp(3.5rem,12vw,6rem)', cursor:'pointer', userSelect:'none',
            animation:'starBob 2.8s ease-in-out infinite',
            filter:'drop-shadow(0 0 24px #ffe066) drop-shadow(0 0 48px #ffd700)',
          }}
        >⭐</div>
        <div style={{
          color:'rgba(255,220,80,.75)', fontSize:'clamp(.6rem,1.7vw,.8rem)',
          animation:'hintFade 2.5s ease-in-out infinite', fontWeight:500,
        }}>tap ⭐ for message · tap stars to reveal who you are</div>
      </div>

      {/* constellation stars */}
      {stars.map((s,i) => (
        <div
          key={i}
          onClick={() => { setRevealed(r => new Set([...r,i])); }}
          style={{
            position:'absolute', left:s.left, top:s.top, cursor:'pointer',
            zIndex:5, transform:'translate(-50%,-50%)',
          }}
        >
          {!revealed.has(i) ? (
            <div style={{
              width:'clamp(36px,8vw,52px)', height:'clamp(36px,8vw,52px)',
              borderRadius:'50%',
              background:`radial-gradient(circle,${s.color}55,${s.color}11)`,
              boxShadow:`0 0 18px ${s.color}66`,
              display:'flex', alignItems:'center', justifyContent:'center',
              animation:`twinkle ${s.dur}s ${s.delay}s ease-in-out infinite`,
              fontSize:'clamp(1.1rem,3vw,1.6rem)',
            }}>✨</div>
          ) : (
            <div style={{
              background:'rgba(255,255,255,.12)', backdropFilter:'blur(8px)',
              border:`1px solid ${s.color}66`,
              borderRadius:12, padding:'4px 10px', textAlign:'center', minWidth:60,
              animation:'popIn .3s ease forwards',
            }}>
              <div style={{ fontSize:'clamp(.6rem,1.6vw,.8rem)', fontWeight:700, color:s.color }}>{s.label}</div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
