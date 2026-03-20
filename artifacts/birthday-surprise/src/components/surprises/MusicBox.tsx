import { useState } from 'react';

const KF = `
@keyframes noteFloat{0%{opacity:1;transform:translateY(0) scale(1)}100%{opacity:0;transform:translateY(-60px) scale(.6) rotate(20deg)}}
@keyframes keyPulse{0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.06)}}
@keyframes charBob{0%,100%{transform:translateY(0) scale(1) rotate(-4deg)}50%{transform:translateY(-18px) scale(1.08) rotate(4deg)}}
@keyframes hintFade{0%,100%{opacity:.4}50%{opacity:.9}}
@keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
`;

const NOTES = ['Do','Re','Mi','Fa','Sol','La','Ti','Do'];
const COLS  = ['#ff79c6','#bd93f9','#8be9fd','#50fa7b','#ffb86c','#ff5555','#f1fa8c','#ff79c6'];

interface P { message: string; onReveal?: () => void }

export default function MusicBox({ onReveal }: P) {
  const [played, setPlayed] = useState<Set<number>>(new Set());
  const [floaters, setFloaters] = useState<{id:number;key:number;x:number}[]>([]);
  const fId = { current: 0 };

  const playNote = (i: number) => {
    if (played.has(i)) return;
    setPlayed(p => new Set([...p,i]));
    setFloaters(f => [...f, { id: ++fId.current, key:i, x: i * 13 + 5 }]);
    setTimeout(() => setFloaters(f => f.filter(x => x.id !== fId.current)), 1500);
  };

  const all = played.size === NOTES.length;

  return (
    <div style={{
      position:'relative', width:'100%', height:'100%', overflow:'hidden',
      background:'linear-gradient(155deg,#78350f 0%,#b45309 30%,#d97706 60%,#92400e 100%)',
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      gap:'clamp(10px,2.5vw,20px)',
    }}>
      <style>{KF}</style>

      {floaters.map(f => (
        <div key={f.id} style={{
          position:'absolute', bottom:'50%', left:`${f.x * 1.1 + 5}%`,
          fontSize:'clamp(1.2rem,3.5vw,2rem)', pointerEvents:'none', zIndex:20,
          animation:'noteFloat 1.4s ease-out forwards',
          color: COLS[f.key%COLS.length],
          filter:`drop-shadow(0 0 6px ${COLS[f.key%COLS.length]})`,
        }}>♪</div>
      ))}

      <div
        onClick={() => onReveal?.()}
        style={{
          fontSize:'clamp(3.5rem,13vw,7rem)', cursor:'pointer', userSelect:'none',
          animation:'charBob 2.8s ease-in-out infinite',
          filter:'drop-shadow(0 0 22px rgba(255,200,80,.5))',
        }}
      >🎵</div>

      <div style={{
        color:'rgba(255,240,180,.9)', fontWeight:700, textAlign:'center',
        fontSize:'clamp(.8rem,2.5vw,1.1rem)',
      }}>
        {all ? '🎶 Beautiful! 🎶' : `Play the Music of Your Heart · ${NOTES.length - played.size} notes left`}
      </div>

      {/* Piano keys */}
      <div style={{ display:'flex', gap:'clamp(3px,1vw,6px)', padding:'0 clamp(8px,2vw,16px)' }}>
        {NOTES.map((n,i) => (
          <button
            key={i}
            onClick={() => playNote(i)}
            style={{
              width:'clamp(36px,8vw,52px)', height:'clamp(120px,28vw,170px)',
              borderRadius:'0 0 8px 8px', border:'none', cursor:'pointer',
              background: played.has(i)
                ? `linear-gradient(to bottom,${COLS[i]},${COLS[i]}88)`
                : 'rgba(255,255,255,.12)',
              borderBottom:`3px solid ${COLS[i]}${played.has(i)?'ff':'55'}`,
              borderTop:`3px solid ${COLS[i]}${played.has(i)?'ff':'44'}`,
              boxShadow: played.has(i) ? `0 0 16px ${COLS[i]}88` : 'none',
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-end',
              paddingBottom:8, position:'relative', overflow:'visible',
              animation:`keyPulse ${1.5+i*.15}s ease-in-out infinite`,
              animationDelay:`${i*.1}s`,
              transition:'background .2s,box-shadow .2s',
              color: played.has(i) ? 'white' : COLS[i],
              fontWeight:700, fontSize:'clamp(.55rem,1.4vw,.75rem)',
            }}
          >{n}</button>
        ))}
      </div>

      {all && (
        <div style={{
          background:'rgba(255,255,255,.18)', backdropFilter:'blur(12px)',
          border:'1px solid rgba(255,255,255,.4)', borderRadius:16,
          padding:'clamp(10px,2.5vw,18px) clamp(16px,4vw,28px)',
          textAlign:'center', maxWidth:'min(380px,90%)',
          color:'white',
        }}>
          <div style={{ fontSize:'clamp(1.2rem,4vw,1.8rem)', fontWeight:700, marginBottom:8 }}>
            🎵 You played the most beautiful song 🎵
          </div>
          <button
            onClick={() => onReveal?.()}
            style={{
              background:'rgba(255,255,255,.25)', color:'white', border:'1px solid rgba(255,255,255,.5)',
              borderRadius:20, padding:'8px 24px', cursor:'pointer', fontWeight:600,
              fontSize:'clamp(.75rem,2vw,.9rem)',
            }}
          >See today's message 💌</button>
        </div>
      )}

      <div style={{
        color:'rgba(255,240,180,.6)', fontSize:'clamp(.6rem,1.7vw,.8rem)',
        animation:'hintFade 2.5s ease-in-out infinite', fontWeight:500,
      }}>✦ tap 🎵 anytime for today's message ✦</div>
    </div>
  );
}
