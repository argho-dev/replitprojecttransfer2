import { useState, useEffect, useRef, useCallback } from 'react';

const KF = `
@keyframes fall{0%{transform:translateY(-60px) rotate(0deg)}100%{transform:translateY(110vh) rotate(360deg)}}
@keyframes catchPop{0%{transform:scale(1)}50%{transform:scale(1.8)}100%{transform:scale(0);opacity:0}}
@keyframes hintFade{0%,100%{opacity:.5}50%{opacity:1}}
@keyframes btnPulse{0%,100%{box-shadow:0 0 0 0 rgba(255,100,160,.4)}70%{box-shadow:0 0 0 12px rgba(255,100,160,0)}}
`;

interface Heart { id:number; x:number; y:number; speed:number; emoji:string; sz:number; caught:boolean }

interface P { message: string; onReveal?: () => void }

export default function HeartGame({ onReveal }: P) {
  const [hearts, setHearts] = useState<Heart[]>([]);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState(0);
  const [phase, setPhase] = useState<'idle'|'playing'|'over'>('idle');
  const idRef = useRef(0);
  const EMOJIS = ['❤️','💕','💖','💗','🌸','✨','💝','💫'];

  const spawn = useCallback(() => {
    setHearts(h => [...h, {
      id: ++idRef.current,
      x: 5 + Math.random() * 85,
      y: -8,
      speed: 0.3 + Math.random() * 0.4,
      emoji: EMOJIS[Math.floor(Math.random()*EMOJIS.length)],
      sz: 1.4 + Math.random() * 0.8,
      caught: false,
    }]);
  }, []);

  useEffect(() => {
    if (phase !== 'playing') return;
    const si = setInterval(spawn, 750);
    const mi = setInterval(() => {
      setHearts(h => {
        let lostCount = 0;
        const next = h.filter(x => {
          if (x.y > 102 && !x.caught) { lostCount++; return false; }
          return true;
        }).map(x => ({ ...x, y: x.y + x.speed * 2.5 }));
        if (lostCount > 0) setMissed(m => { const n = m + lostCount; if (n >= 5) setPhase('over'); return n; });
        return next;
      });
    }, 16);
    return () => { clearInterval(si); clearInterval(mi); };
  }, [phase, spawn]);

  const catchIt = (id: number) => {
    setHearts(h => h.map(x => x.id === id ? { ...x, caught: true, y: x.y - 30 } : x));
    setTimeout(() => setHearts(h => h.filter(x => x.id !== id)), 300);
    setScore(s => s + 1);
  };

  const reset = () => { setHearts([]); setScore(0); setMissed(0); setPhase('idle'); };

  return (
    <div style={{
      position:'relative', width:'100%', height:'100%', overflow:'hidden',
      background:'linear-gradient(160deg,#ff6b9d 0%,#ff8fb1 30%,#ffc2d1 65%,#ff85a1 100%)',
    }}>
      <style>{KF}</style>

      {phase === 'playing' && (
        <div style={{
          position:'absolute', top:'clamp(8px,2vw,16px)', left:0, right:0,
          display:'flex', justifyContent:'space-between', padding:'0 clamp(12px,3vw,24px)',
          zIndex:20, fontWeight:700, color:'white',
          fontSize:'clamp(.85rem,2.2vw,1.1rem)',
        }}>
          <span style={{background:'rgba(255,255,255,.25)', borderRadius:20, padding:'4px 14px'}}>❤️ {score}</span>
          <span style={{background:'rgba(255,255,255,.25)', borderRadius:20, padding:'4px 14px'}}>💔 {missed}/5</span>
        </div>
      )}

      {phase === 'playing' && hearts.map(h => (
        <div
          key={h.id}
          onClick={() => catchIt(h.id)}
          style={{
            position:'absolute', left:`${h.x}%`, top:`${h.y}%`,
            fontSize:`${h.sz}rem`, cursor:'pointer', userSelect:'none',
            zIndex:10, filter:'drop-shadow(0 0 6px rgba(255,50,100,.7))',
            animation: h.caught ? 'catchPop .3s ease forwards' : undefined,
          }}
        >{h.emoji}</div>
      ))}

      {phase === 'idle' && (
        <div style={{
          position:'absolute', inset:0, display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center', gap:'clamp(12px,3vw,24px)', zIndex:30,
        }}>
          <div style={{ fontSize:'clamp(3.5rem,14vw,7rem)' }}>🎮</div>
          <div style={{ textAlign:'center', color:'white' }}>
            <div style={{ fontSize:'clamp(1.1rem,3.5vw,1.6rem)', fontWeight:700, marginBottom:8 }}>Catch the Hearts!</div>
            <div style={{ fontSize:'clamp(.75rem,2vw,.95rem)', opacity:.8, marginBottom:'clamp(16px,4vw,28px)' }}>Tap the falling hearts before they escape</div>
          </div>
          <button
            onClick={() => setPhase('playing')}
            style={{
              background:'white', color:'#ff6b9d', border:'none', borderRadius:30,
              padding:'12px 36px', fontWeight:700, fontSize:'clamp(.9rem,2.5vw,1.1rem)',
              cursor:'pointer', animation:'btnPulse 2s ease-in-out infinite',
            }}
          >Let's Play! ❤️</button>
          <button
            onClick={() => onReveal?.()}
            style={{
              background:'transparent', color:'rgba(255,255,255,.75)', border:'1px solid rgba(255,255,255,.5)',
              borderRadius:20, padding:'8px 24px', fontSize:'clamp(.7rem,1.8vw,.85rem)', cursor:'pointer',
            }}
          >See today's message instead 💌</button>
        </div>
      )}

      {phase === 'over' && (
        <div style={{
          position:'absolute', inset:0, display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center', gap:'clamp(10px,2.5vw,20px)', zIndex:30,
          padding:'0 clamp(16px,4vw,32px)',
        }}>
          <div style={{ fontSize:'clamp(3rem,12vw,6rem)' }}>🎊</div>
          <div style={{
            background:'rgba(255,255,255,.25)', backdropFilter:'blur(12px)', borderRadius:20,
            padding:'clamp(16px,4vw,28px)', textAlign:'center', color:'white', width:'min(380px,90%)',
          }}>
            <div style={{ fontSize:'clamp(1.1rem,3.5vw,1.5rem)', fontWeight:700, marginBottom:6 }}>
              {score >= 20 ? '🌟 Amazing!' : score >= 10 ? '💖 Great!' : '💕 Nice try!'}
            </div>
            <div style={{ fontSize:'clamp(2rem,7vw,3.5rem)', fontWeight:900 }}>{score}</div>
            <div style={{ opacity:.8, fontSize:'clamp(.75rem,2vw,.9rem)', marginBottom:12 }}>hearts caught</div>
          </div>
          <div style={{ display:'flex', gap:12, flexWrap:'wrap', justifyContent:'center' }}>
            <button onClick={reset}
              style={{ background:'white', color:'#ff6b9d', border:'none', borderRadius:24, padding:'10px 28px', fontWeight:700, cursor:'pointer', fontSize:'clamp(.8rem,2vw,.95rem)' }}>
              Play Again 🔄
            </button>
            <button onClick={() => onReveal?.()}
              style={{ background:'rgba(255,255,255,.25)', color:'white', border:'1px solid rgba(255,255,255,.6)', borderRadius:24, padding:'10px 28px', fontWeight:600, cursor:'pointer', fontSize:'clamp(.8rem,2vw,.95rem)' }}>
              Today's Message 💌
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
