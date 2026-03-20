import { useState } from 'react';

const KF = `
@keyframes bubFloat{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-12px) scale(1.03)}}
@keyframes hintFade{0%,100%{opacity:.4}50%{opacity:.9}}
@keyframes popIn{0%{opacity:0;transform:scale(.5) rotate(-10deg)}100%{opacity:1;transform:scale(1) rotate(0deg)}}
@keyframes charBob{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-18px) scale(1.1)}}
`;

const MSGS = [
  "You make ordinary days feel special ✨",
  "You matter more than you know 💕",
  "This is just a small thing for someone not small to me 🌸",
  "Every time I see you smile, the world feels lighter 🌟",
  "You have a rare gift of making people feel seen 💖",
  "I hope you know how truly special you are 💫",
  "Some people leave a mark on your heart without even trying 🦋",
  "You're the kind of person songs are written about 🎵",
  "The world is genuinely better because you're in it 🌍",
];

interface P { message: string; onReveal?: () => void }

export default function MessageWall({ onReveal }: P) {
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const cols = ['#ff79c6','#bd93f9','#8be9fd','#50fa7b','#ffb86c','#ff5555','#f1fa8c','#ff92d0','#a29bfe'];

  const msgs = MSGS.slice(0,9);

  return (
    <div style={{
      position:'relative', width:'100%', height:'100%', overflow:'hidden',
      background:'linear-gradient(145deg,#0d7377 0%,#14a085 30%,#212f3d 65%,#1a5276 100%)',
      display:'flex', flexDirection:'column',
    }}>
      <style>{KF}</style>

      <div style={{ textAlign:'center', padding:'clamp(12px,3vw,20px) 16px clamp(6px,1.5vw,12px)', zIndex:10 }}>
        <div
          onClick={() => onReveal?.()}
          style={{
            display:'inline-block', fontSize:'clamp(2.5rem,10vw,4.5rem)', cursor:'pointer', userSelect:'none',
            animation:'charBob 2.8s ease-in-out infinite',
            filter:'drop-shadow(0 0 16px rgba(100,220,200,.6))',
          }}
        >💬</div>
        <div style={{
          color:'rgba(180,240,230,.8)', fontSize:'clamp(.65rem,1.8vw,.85rem)',
          marginTop:4, animation:'hintFade 2.5s ease-in-out infinite', fontWeight:500,
        }}>tap bubbles to reveal messages · tap 💬 for today's</div>
      </div>

      <div style={{
        flex:1, display:'grid', gridTemplateColumns:'repeat(3,1fr)',
        gap:'clamp(8px,2vw,16px)', padding:'0 clamp(12px,3vw,20px) clamp(12px,3vw,20px)',
        overflow:'hidden',
      }}>
        {msgs.map((m, i) => (
          <div
            key={i}
            onClick={() => setRevealed(r => new Set([...r,i]))}
            style={{
              cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
              borderRadius:16, transition:'transform .15s',
              border:`2px solid ${cols[i%cols.length]}44`,
              background: revealed.has(i)
                ? `linear-gradient(135deg,${cols[i%cols.length]}22,${cols[i%cols.length]}11)`
                : `radial-gradient(circle,${cols[i%cols.length]}28,${cols[i%cols.length]}0a)`,
              boxShadow:`0 0 18px ${cols[i%cols.length]}33`,
              animation:`bubFloat ${2.5+i*.3}s ${i*.15}s ease-in-out infinite`,
              padding:revealed.has(i) ? '8px' : 0,
              minHeight:'clamp(70px,15vw,110px)',
            }}
          >
            {!revealed.has(i) ? (
              <span style={{ fontSize:'clamp(1.6rem,5vw,2.5rem)', animation:'hintFade 2s ease-in-out infinite' }}>💝</span>
            ) : (
              <p style={{
                color:'white', fontSize:'clamp(.6rem,1.6vw,.8rem)', textAlign:'center',
                lineHeight:1.4, animation:'popIn .4s ease forwards',
              }}>{m}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
