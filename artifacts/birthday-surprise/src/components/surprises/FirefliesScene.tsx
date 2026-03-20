const KF = `
@keyframes ff{0%,100%{transform:translate(0,0) scale(1);opacity:.2}30%{transform:translate(40px,-32px) scale(1.5);opacity:1}65%{transform:translate(-28px,38px) scale(.7);opacity:.65}}
@keyframes charBob{0%,100%{transform:translateY(0) scale(1) rotate(-4deg)}50%{transform:translateY(-22px) scale(1.1) rotate(6deg)}}
@keyframes hintFade{0%,100%{opacity:.35}50%{opacity:.85}}
@keyframes bgPulse{0%,100%{opacity:.8}50%{opacity:1}}
`;

interface P { message: string; onReveal?: () => void }

export default function FirefliesScene({ onReveal }: P) {
  const flies = Array.from({ length: 38 }, (_, i) => {
    const cols = ['#ffe066','#b0f080','#ff79c6','#8be9fd','#ffffff','#ffb347','#a29bfe'];
    return {
      left: `${3 + ((i * 2.8 + Math.sin(i * 1.7) * 18) % 93)}%`,
      top: `${4 + ((i * 2.5 + Math.cos(i * 1.4) * 22) % 89)}%`,
      sz: 6 + (i % 5) * 2.5,
      dur: 3.5 + (i % 7) * 1.1,
      delay: -(i * 0.38),
      color: cols[i % cols.length],
    };
  });

  return (
    <div style={{
      position:'relative', width:'100%', height:'100%', overflow:'hidden',
      background:'linear-gradient(150deg,#08021c 0%,#160a3e 30%,#0c1952 60%,#06122a 100%)',
      display:'flex', alignItems:'center', justifyContent:'center',
    }}>
      <style>{KF}</style>

      {flies.map((f,i) => (
        <div key={i} style={{
          position:'absolute', left:f.left, top:f.top,
          width:f.sz, height:f.sz, borderRadius:'50%',
          background:f.color,
          boxShadow:`0 0 ${f.sz*3}px ${f.sz*1.5}px ${f.color}55`,
          animation:`ff ${f.dur}s ${f.delay}s ease-in-out infinite`,
          pointerEvents:'none',
        }}/>
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
            animation:'charBob 3s ease-in-out infinite',
            filter:'drop-shadow(0 0 24px #ffe066) drop-shadow(0 0 50px #ffd70088)',
          }}
        >🌟</div>
        <div style={{
          color:'rgba(255,230,80,.75)', fontSize:'clamp(.7rem,2vw,.9rem)',
          animation:'hintFade 2.5s ease-in-out infinite', letterSpacing:'.06em', fontWeight:500,
        }}>✦ tap the firefly for today's message ✦</div>
      </div>
    </div>
  );
}
