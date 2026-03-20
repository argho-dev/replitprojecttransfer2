import { useEffect, useRef, useState } from 'react';

const KF = `
@keyframes drop{0%{transform:translateY(-50px) rotate(0deg);opacity:0}5%{opacity:1}90%{opacity:.9}100%{transform:translateY(110vh) rotate(var(--rot));opacity:0}}
@keyframes cloudBob{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-20px) scale(1.08)}}
@keyframes hintFade{0%,100%{opacity:.4}50%{opacity:.9}}
`;

const EMOJIS = ['💖','✨','🌸','💕','🌟','💫','🦋','🌺','💝','🎀','🌷','💗','🍓','🌈','🎊'];

interface P { message: string; onReveal?: () => void }

export default function EmojiRain({ onReveal }: P) {
  const [drops, setDrops] = useState<{id:number;e:string;x:number;dur:number;delay:number;sz:number;rot:number}[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    const spawn = () => setDrops(d => [
      ...d.slice(-80),
      ...Array.from({ length: 4 }, () => ({
        id: ++idRef.current,
        e: EMOJIS[Math.floor(Math.random()*EMOJIS.length)],
        x: Math.random() * 97,
        dur: 4 + Math.random() * 4,
        delay: Math.random() * 0.8,
        sz: 0.9 + Math.random() * 1.1,
        rot: (Math.random() - 0.5) * 400,
      })),
    ]);
    spawn();
    const iv = setInterval(spawn, 600);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{
      position:'relative', width:'100%', height:'100%', overflow:'hidden',
      background:'linear-gradient(155deg,#7c3aed 0%,#a855f7 30%,#d946ef 65%,#9333ea 100%)',
      display:'flex', alignItems:'center', justifyContent:'center',
    }}>
      <style>{KF}</style>

      {drops.map(d => (
        <div key={d.id} style={{
          position:'absolute', left:`${d.x}%`, top:0,
          fontSize:`${d.sz}rem`, userSelect:'none', pointerEvents:'none',
          ['--rot' as any]: `${d.rot}deg`,
          animation:`drop ${d.dur}s ${d.delay}s linear forwards`,
        }}>{d.e}</div>
      ))}

      <div style={{
        position:'relative', zIndex:10, textAlign:'center',
        display:'flex', flexDirection:'column', alignItems:'center',
        gap:'clamp(10px,2.5vw,20px)',
      }}>
        <div
          onClick={() => onReveal?.()}
          style={{
            fontSize:'clamp(5rem,17vw,9rem)', cursor:'pointer', userSelect:'none',
            animation:'cloudBob 2.8s ease-in-out infinite',
            filter:'drop-shadow(0 0 28px rgba(255,255,255,.5)) drop-shadow(0 0 56px #e879f9)',
          }}
        >🌈</div>
        <div style={{
          color:'rgba(255,220,255,.85)', fontSize:'clamp(.7rem,2vw,.9rem)',
          animation:'hintFade 2.5s ease-in-out infinite', letterSpacing:'.06em', fontWeight:500,
        }}>✦ tap the rainbow for today's message ✦</div>
      </div>
    </div>
  );
}
