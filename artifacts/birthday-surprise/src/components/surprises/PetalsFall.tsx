const KF = `
@keyframes petalFall{0%{transform:translateY(-40px) rotate(0deg) translateX(0);opacity:0}5%{opacity:1}90%{opacity:.8}100%{transform:translateY(110vh) rotate(540deg) translateX(var(--sw));opacity:0}}
@keyframes flowerPop{0%,100%{transform:translateY(0) scale(1) rotate(-5deg)}50%{transform:translateY(-22px) scale(1.12) rotate(6deg)}}
@keyframes hintFade{0%,100%{opacity:.4}50%{opacity:.9}}
`;

interface P { message: string; onReveal?: () => void }

export default function PetalsFall({ onReveal }: P) {
  const petals = Array.from({ length: 28 }, (_, i) => {
    const cols = ['#ff79c6','#ffb8d0','#f9a8d4','#fbcfe8','#fce7f3','#ff92d0','#ffa0c0'];
    return {
      left: `${(i * 3.5) % 98}%`,
      dur: 5 + (i % 7) * 1.2,
      delay: -(i * 0.55),
      sz: 1 + (i % 3) * 0.5,
      sw: `${(i % 2 === 0 ? 1 : -1) * (20 + (i % 5) * 10)}px`,
      color: cols[i % cols.length],
    };
  });

  return (
    <div style={{
      position:'relative', width:'100%', height:'100%', overflow:'hidden',
      background:'linear-gradient(160deg,#fff0f6 0%,#ffe4ef 35%,#ffd6e8 65%,#ffebf3 100%)',
      display:'flex', alignItems:'center', justifyContent:'center',
    }}>
      <style>{KF}</style>

      {petals.map((p,i) => (
        <div key={i} style={{
          position:'absolute', left:p.left, top:0,
          fontSize:`${p.sz}rem`,
          animation:`petalFall ${p.dur}s ${p.delay}s linear infinite`,
          ['--sw' as any]: p.sw,
          pointerEvents:'none', userSelect:'none',
          filter:`drop-shadow(0 2px 4px ${p.color}66)`,
        }}>🌸</div>
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
            animation:'flowerPop 2.8s ease-in-out infinite',
            filter:'drop-shadow(0 0 22px rgba(255,100,180,.4))',
          }}
        >🌷</div>
        <div style={{
          color:'rgba(180,60,110,.8)', fontSize:'clamp(.7rem,2vw,.9rem)',
          animation:'hintFade 2.5s ease-in-out infinite', letterSpacing:'.06em', fontWeight:600,
        }}>✦ tap the flower for today's message ✦</div>
      </div>
    </div>
  );
}
