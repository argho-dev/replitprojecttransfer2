const KF = `
@keyframes orbMove{0%{transform:translate(0,0) scale(1)}25%{transform:translate(var(--ox),var(--oy)) scale(1.1)}50%{transform:translate(calc(var(--ox)*-.7),calc(var(--oy)*1.3)) scale(.9)}75%{transform:translate(calc(var(--ox)*.4),calc(var(--oy)*-.8)) scale(1.05)}100%{transform:translate(0,0) scale(1)}}
@keyframes charGlow{0%,100%{transform:translateY(0) scale(1);filter:drop-shadow(0 0 20px #e879f9) drop-shadow(0 0 40px #a855f7)}50%{transform:translateY(-22px) scale(1.1);filter:drop-shadow(0 0 40px #e879f9) drop-shadow(0 0 80px #a855f7)}}
@keyframes hintFade{0%,100%{opacity:.4}50%{opacity:.9}}
`;

interface P { message: string; onReveal?: () => void }

export default function GlowingOrbs({ onReveal }: P) {
  const orbs = [
    { color:'#ff79c6', sz:120, left:'5%',  top:'8%',  ox:'80px',  oy:'60px',  dur:11 },
    { color:'#bd93f9', sz:90,  left:'70%', top:'5%',  ox:'-60px', oy:'90px',  dur:14 },
    { color:'#8be9fd', sz:100, left:'80%', top:'55%', ox:'-70px', oy:'-50px', dur:12 },
    { color:'#50fa7b', sz:70,  left:'10%', top:'65%', ox:'50px',  oy:'-70px', dur:9  },
    { color:'#ffb86c', sz:85,  left:'40%', top:'75%', ox:'60px',  oy:'-40px', dur:16 },
    { color:'#ff5555', sz:60,  left:'55%', top:'10%', ox:'-40px', oy:'60px',  dur:10 },
    { color:'#f1fa8c', sz:75,  left:'25%', top:'20%', ox:'70px',  oy:'50px',  dur:13 },
  ];

  return (
    <div style={{
      position:'relative', width:'100%', height:'100%', overflow:'hidden',
      background:'linear-gradient(145deg,#2d0059 0%,#4a0080 30%,#6600aa 60%,#1a003d 100%)',
      display:'flex', alignItems:'center', justifyContent:'center',
    }}>
      <style>{KF}</style>

      {orbs.map((o,i) => (
        <div key={i} style={{
          position:'absolute', left:o.left, top:o.top,
          width:o.sz, height:o.sz, borderRadius:'50%',
          background:`radial-gradient(circle,${o.color}50,${o.color}10)`,
          boxShadow:`0 0 ${o.sz}px ${o.sz/2}px ${o.color}33`,
          ['--ox' as any]: o.ox, ['--oy' as any]: o.oy,
          animation:`orbMove ${o.dur}s ease-in-out infinite`,
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
            animation:'charGlow 2.8s ease-in-out infinite',
          }}
        >🔮</div>
        <div style={{
          color:'rgba(220,180,255,.85)', fontSize:'clamp(.7rem,2vw,.9rem)',
          animation:'hintFade 2.5s ease-in-out infinite', letterSpacing:'.06em', fontWeight:500,
        }}>✦ tap the orb for today's message ✦</div>
      </div>
    </div>
  );
}
