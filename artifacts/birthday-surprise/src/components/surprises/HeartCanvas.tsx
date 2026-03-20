const KF = `
@keyframes heartFloat{0%,100%{transform:translateY(0) scale(1) rotate(-3deg)}50%{transform:translateY(-24px) scale(1.12) rotate(4deg)}}
@keyframes heartPop{0%{opacity:0;transform:translate(-50%,-50%) scale(.2)}60%{opacity:1;transform:translate(-50%,-50%) scale(1.2)}100%{opacity:0;transform:translate(-50%,-50%) translateY(-80px) scale(.8)}}
@keyframes hintFade{0%,100%{opacity:.4}50%{opacity:.9}}
@keyframes orbSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
`;

interface P { message: string; onReveal?: () => void }

export default function HeartCanvas({ onReveal }: P) {
  const orbEmojis = ['💕','💗','✨','💖','🌸','💝','🦋','💫'];

  return (
    <div style={{
      position:'relative', width:'100%', height:'100%', overflow:'hidden',
      background:'linear-gradient(145deg,#ff0a54 0%,#ff477e 25%,#c9184a 55%,#800f2f 100%)',
      display:'flex', alignItems:'center', justifyContent:'center',
    }}>
      <style>{KF}</style>

      {/* Orbital ring */}
      <div style={{
        position:'absolute',
        width:'clamp(220px,55vw,380px)', height:'clamp(220px,55vw,380px)',
        borderRadius:'50%',
        border:'1px dashed rgba(255,200,200,.25)',
        animation:'orbSpin 18s linear infinite',
        pointerEvents:'none',
      }}>
        {orbEmojis.map((e,i) => {
          const ang = (i / orbEmojis.length) * 360;
          return (
            <div key={i} style={{
              position:'absolute', left:'50%', top:'50%',
              transform:`rotate(${ang}deg) translateX(50%) rotate(-${ang}deg)`,
              fontSize:'clamp(1rem,2.5vw,1.5rem)',
              marginLeft:'-0.75em', marginTop:'-0.75em',
            }}>{e}</div>
          );
        })}
      </div>

      <div style={{
        position:'relative', zIndex:10, textAlign:'center',
        display:'flex', flexDirection:'column', alignItems:'center',
        gap:'clamp(10px,2.5vw,20px)',
      }}>
        <div
          onClick={() => onReveal?.()}
          style={{
            fontSize:'clamp(5rem,18vw,9.5rem)', cursor:'pointer', userSelect:'none',
            animation:'heartFloat 2.6s ease-in-out infinite',
            filter:'drop-shadow(0 0 30px rgba(255,255,255,.5)) drop-shadow(0 0 60px #ff69b4)',
          }}
        >💖</div>
        <div style={{
          color:'rgba(255,220,230,.8)', fontSize:'clamp(.7rem,2vw,.9rem)',
          animation:'hintFade 2.5s ease-in-out infinite', letterSpacing:'.06em', fontWeight:500,
        }}>✦ tap the heart for today's message ✦</div>
      </div>
    </div>
  );
}
