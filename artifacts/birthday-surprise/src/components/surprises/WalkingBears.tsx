const KF = `
@keyframes walkR{0%{transform:translateX(-120px)}100%{transform:translateX(110vw)}}
@keyframes walkL{0%{transform:translateX(110vw)}100%{transform:translateX(-120px)}}
@keyframes charBounce{0%,100%{transform:translateY(0) scale(1) rotate(-4deg)}50%{transform:translateY(-22px) scale(1.1) rotate(5deg)}}
@keyframes hintFade{0%,100%{opacity:.4}50%{opacity:.9}}
@keyframes sway{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(5deg)}}
`;

interface P { message: string; onReveal?: () => void }

export default function WalkingBears({ onReveal }: P) {
  const walkers = [
    { e:'🧸', top:'8%',  dir:'R', dur:10, delay:-2,  sz:'clamp(2rem,7vw,4rem)' },
    { e:'🐻', top:'22%', dir:'L', dur:14, delay:-6,  sz:'clamp(1.5rem,5vw,3rem)' },
    { e:'🧸', top:'38%', dir:'R', dur:12, delay:-4,  sz:'clamp(2.5rem,8vw,4.5rem)' },
    { e:'🐻', top:'56%', dir:'L', dur:9,  delay:-1,  sz:'clamp(1.8rem,6vw,3.5rem)' },
    { e:'🧸', top:'70%', dir:'R', dur:16, delay:-8,  sz:'clamp(1.5rem,5vw,2.8rem)' },
    { e:'🐻', top:'82%', dir:'L', dur:11, delay:-3,  sz:'clamp(2rem,6.5vw,3.8rem)' },
  ];

  return (
    <div style={{
      position:'relative', width:'100%', height:'100%', overflow:'hidden',
      background:'linear-gradient(160deg,#d4edda 0%,#a8d8b9 30%,#85c99e 60%,#6dbf82 100%)',
      display:'flex', alignItems:'center', justifyContent:'center',
    }}>
      <style>{KF}</style>

      {walkers.map((w,i) => (
        <div key={i} style={{
          position:'absolute', top:w.top,
          fontSize:w.sz, userSelect:'none', pointerEvents:'none',
          animation:`walk${w.dir} ${w.dur}s ${w.delay}s linear infinite`,
          transform: w.dir === 'L' ? 'scaleX(-1)' : undefined,
          filter:'drop-shadow(0 4px 8px rgba(0,100,50,.2))',
        }}>{w.e}</div>
      ))}

      <div style={{
        position:'relative', zIndex:10, textAlign:'center',
        display:'flex', flexDirection:'column', alignItems:'center',
        gap:'clamp(10px,2.5vw,20px)',
      }}>
        <div
          onClick={() => onReveal?.()}
          style={{
            fontSize:'clamp(5rem,18vw,9.5rem)', cursor:'pointer', userSelect:'none',
            animation:'charBounce 2.6s ease-in-out infinite',
            filter:'drop-shadow(0 0 20px rgba(50,160,80,.4)) drop-shadow(0 8px 16px rgba(0,100,50,.3))',
          }}
        >🐻</div>
        <div style={{
          color:'rgba(30,100,60,.85)', fontSize:'clamp(.7rem,2vw,.9rem)',
          animation:'hintFade 2.5s ease-in-out infinite', letterSpacing:'.06em', fontWeight:700,
        }}>✦ tap the bear for today's message ✦</div>
      </div>
    </div>
  );
}
