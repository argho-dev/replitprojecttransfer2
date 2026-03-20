import { useEffect, useState } from 'react';
import { gsap } from 'gsap';
import Starfield from './Starfield';

const ACCESS_KEY = 'bday_access';

interface AccessGateProps {
  onGranted: () => void;
}

export default function AccessGate({ onGranted }: AccessGateProps) {
  const [denied, setDenied] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(ACCESS_KEY) === 'yes') {
      onGranted();
      return;
    }
    const t = setTimeout(() => setVisible(true), 400);
    return () => clearTimeout(t);
  }, [onGranted]);

  useEffect(() => {
    if (!visible) return;
    gsap.fromTo('.access-card',
      { opacity: 0, y: 30, scale: 0.92 },
      { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power3.out' }
    );
  }, [visible]);

  const handleYes = () => {
    localStorage.setItem(ACCESS_KEY, 'yes');
    gsap.to('.access-card', {
      opacity: 0, scale: 1.05, duration: 0.5, ease: 'power2.in',
      onComplete: onGranted,
    });
  };

  const handleNo = () => {
    setDenied(true);
    gsap.fromTo('.denied-msg',
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
    );
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#000' }}>
      <Starfield />
      {visible && (
        <div
          className="access-card glass-card relative z-10 flex flex-col items-center gap-8 text-center px-10 py-12"
          style={{ maxWidth: 420, width: '90%', opacity: 0 }}
        >
          {!denied ? (
            <>
              <div style={{ fontSize: '3rem', filter: 'drop-shadow(0 0 20px #ff79c6)' }}>💛</div>
              <h1
                style={{
                  fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
                  fontWeight: 700,
                  color: '#f8f8f2',
                  letterSpacing: '0.02em',
                  lineHeight: 1.3,
                }}
              >
                Are you Anuska?
              </h1>
              <p style={{ color: '#bd93f9', fontSize: '1rem', opacity: 0.8 }}>
                This experience was made for someone very special.
              </p>
              <div className="flex gap-4 w-full justify-center">
                <button
                  className="glow-button"
                  style={{ padding: '14px 40px', fontSize: '1rem' }}
                  onClick={handleYes}
                >
                  Yes, it's me! 💖
                </button>
                <button
                  onClick={handleNo}
                  style={{
                    padding: '14px 32px',
                    fontSize: '1rem',
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 50,
                    color: '#aaa',
                    cursor: 'pointer',
                    fontWeight: 500,
                  }}
                >
                  No
                </button>
              </div>
            </>
          ) : (
            <div className="denied-msg flex flex-col items-center gap-5" style={{ opacity: 0 }}>
              <div style={{ fontSize: '3rem' }}>💛</div>
              <p style={{ color: '#f8f8f2', fontSize: '1.3rem', fontWeight: 600, lineHeight: 1.5 }}>
                Sorry, this is only made for her 💛
              </p>
              <p style={{ color: '#bd93f9', fontSize: '0.95rem', opacity: 0.7 }}>
                Come back when you're Anuska 🌸
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
