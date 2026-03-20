import { useState } from 'react';

const KF = `
@keyframes bubRise{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-14px) scale(1.04)}}
@keyframes charBob{0%,100%{transform:translateY(0) scale(1) rotate(-3deg)}50%{transform:translateY(-20px) scale(1.1) rotate(4deg)}}
@keyframes hintFade{0%,100%{opacity:.4}50%{opacity:.9}}
@keyframes popIn{0%{opacity:0;transform:scale(.5) rotate(-8deg)}100%{opacity:1;transform:scale(1) rotate(0deg)}}
`;

const BUBBLES = [
  { emoji:'💕', msg:"You're the reason I smile more these days", color:'#ff79c6' },
  { emoji:'✨', msg:"There's no one quite like you", color:'#bd93f9' },
  { emoji:'🌸', msg:"You deserve every good thing coming to you", color:'#f9a8d4' },
  { emoji:'💖', msg:"Even a small moment with you is a good moment", color:'#ff2d78' },
  { emoji:'🌟', msg:"You have a way of making people feel better just by existing", color:'#8be9fd' },
  { emoji:'🦋', msg:"I hope you see yourself the way I see you", color:'#50fa7b' },
];

interface P { message: string; onReveal?: () => void }

export default function BubbleMessages({ onReveal }: P) {
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  return (
    <div style={{
      position:'relative', width:'100%', height:'100%', overflow:'hidden',
      background:'linear-gradient(145deg,#0891b2 0%,#06b6d4 30%,#22d3ee 60%,#0369a1 100%)',
      display:'flex', flexDirection:'column', alignItems:'center',
    }}>
      <style>{KF}</style>

      <div style={{ textAlign:'center', padding:'clamp(12px,3vw,22px) 16px clamp(6px,1.5vw,10px)', zIndex:10 }}>
        <div
          onClick={() => onReveal?.()}
          style={{
            display:'inline-block', fontSize:'clamp(3rem,12vw,5.5rem)', cursor:'pointer', userSelect:'none',
            animation:'charBob 2.8s ease-in-out infinite',
            filter:'drop-shadow(0 0 24px rgba(255,255,255,.5)) drop-shadow(0 0 48px #22d3ee)',
          }}
        >🫧</div>
        <div style={{
          color:'rgba(220,255,255,.8)', fontSize:'clamp(.65rem,1.8vw,.85rem)',
          marginTop:4, animation:'hintFade 2.5s ease-in-out infinite', fontWeight:500,
        }}>tap 🫧 for today's message · tap bubbles to reveal thoughts</div>
      </div>

      <div style={{
        flex:1, display:'grid', gridTemplateColumns:'repeat(3,1fr)',
        gap:'clamp(10px,2.5vw,18px)', padding:'0 clamp(12px,3vw,24px) clamp(12px,3vw,24px)',
        alignContent:'center',
      }}>
        {BUBBLES.map((b,i) => (
          <div
            key={i}
            onClick={() => setRevealed(r => new Set([...r,i]))}
            style={{
              cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
              transition:'transform .15s',
              border:`2px solid ${b.color}66`,
              background: revealed.has(i)
                ? 'rgba(255,255,255,.2)'
                : `radial-gradient(circle,${b.color}33,${b.color}0a)`,
              boxShadow:`0 0 24px ${b.color}44`,
              animation:`bubRise ${2.2+i*.35}s ${i*.2}s ease-in-out infinite`,
              width:'clamp(80px,18vw,130px)', height:'clamp(80px,18vw,130px)',
              justifySelf:'center', alignSelf:'center',
              padding: revealed.has(i) ? 8 : 0,
              borderRadius: revealed.has(i) ? 14 : '50%',
            }}
          >
            {!revealed.has(i) ? (
              <span style={{ fontSize:'clamp(1.8rem,5.5vw,2.8rem)' }}>{b.emoji}</span>
            ) : (
              <p style={{
                color:'white', fontSize:'clamp(.55rem,1.5vw,.75rem)', textAlign:'center',
                lineHeight:1.4, animation:'popIn .35s ease forwards', padding:4,
              }}>{b.emoji} {b.msg}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
