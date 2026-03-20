const KF = `
@keyframes bearFloat{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-20px) rotate(3deg)}}
@keyframes bearFloat2{0%,100%{transform:translateY(0) rotate(4deg)}50%{transform:translateY(-16px) rotate(-4deg)}}
@keyframes bearFloat3{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-24px) rotate(5deg)}}
@keyframes charPop{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-20px) scale(1.1)}}
@keyframes hintFade{0%,100%{opacity:.4}50%{opacity:.9}}
@keyframes twirl{0%,100%{transform:rotate(-8deg) scale(1)}50%{transform:rotate(8deg) scale(1.08)}}
`;

interface P { message: string; onReveal?: () => void }

export default function FloatingBears({ onReveal }: P) {
  const sideBears = [
    { e:'🧸', sz:'clamp(3rem,10vw,5rem)', left:'4%',  top:'15%', anim:'bearFloat 3.2s ease-in-out infinite' },
    { e:'🐻', sz:'clamp(2.5rem,8vw,4rem)', left:'14%', top:'55%', anim:'bearFloat2 2.8s .5s ease-in-out infinite' },
    { e:'🧸', sz:'clamp(2rem,7vw,3.5rem)', left:'3%',  top:'72%', anim:'bearFloat3 3.5s .2s ease-in-out infinite' },
    { e:'🐻', sz:'clamp(3rem,9vw,4.5rem)', right:'5%', top:'12%', anim:'bearFloat 3s .8s ease-in-out infinite' },
    { e:'🧸', sz:'clamp(2.5rem,8vw,4rem)', right:'4%', top:'50%', anim:'bearFloat2 2.6s .3s ease-in-out infinite' },
    { e:'🐻', sz:'clamp(2rem,6vw,3rem)', right:'6%', top:'75%', anim:'bearFloat3 3.8s .6s ease-in-out infinite' },
  ];

  return (
    <div style={{
      position:'relative', width:'100%', height:'100%', overflow:'hidden',
      background:'linear-gradient(150deg,#f8b4d9 0%,#fcd3e3 30%,#fde8f0 60%,#f9c0d0 100%)',
      display:'flex', alignItems:'center', justifyContent:'center',
    }}>
      <style>{KF}</style>

      {sideBears.map((b,i) => (
        <div key={i} style={{
          position:'absolute', ...(b.left ? {left:b.left} : {}), ...(b.right ? {right:(b as any).right} : {}),
          top:b.top, fontSize:b.sz,
          animation:b.anim, pointerEvents:'none', userSelect:'none',
          filter:'drop-shadow(0 4px 8px rgba(200,100,150,.3))',
        }}>{b.e}</div>
      ))}

      <div style={{
        position:'relative', zIndex:10, textAlign:'center',
        display:'flex', flexDirection:'column', alignItems:'center',
        gap:'clamp(10px,2.5vw,22px)',
      }}>
        <div
          onClick={() => onReveal?.()}
          style={{
            fontSize:'clamp(5rem,18vw,10rem)', cursor:'pointer', userSelect:'none',
            animation:'charPop 2.5s ease-in-out infinite',
            filter:'drop-shadow(0 0 20px rgba(200,80,120,.4))',
          }}
        >🧸</div>
        <div style={{
          color:'rgba(160,50,90,.8)', fontSize:'clamp(.7rem,2vw,.9rem)',
          animation:'hintFade 2.5s ease-in-out infinite', letterSpacing:'.06em', fontWeight:600,
        }}>✦ tap the bear for today's message ✦</div>
      </div>
    </div>
  );
}
