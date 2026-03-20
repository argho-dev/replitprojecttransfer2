import { useEffect, useRef } from 'react';

const COLORS = ['#ff79c6', '#bd93f9', '#8be9fd', '#50fa7b', '#ffb86c', '#ff5555', '#f1fa8c'];

export function spawnConfetti(x?: number, y?: number) {
  const count = 30;
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = `${x ?? Math.random() * 100}vw`;
    piece.style.top = `${y ?? -20}px`;
    piece.style.backgroundColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    piece.style.animationDuration = `${Math.random() * 2 + 1.5}s`;
    piece.style.animationDelay = `${Math.random() * 0.5}s`;
    piece.style.width = `${Math.random() * 8 + 4}px`;
    piece.style.height = `${Math.random() * 8 + 4}px`;
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 3000);
  }
}

export function spawnFloatingHearts(x: number, y: number) {
  const emojis = ['❤️', '💕', '💖', '💗', '💝', '✨', '🌸'];
  for (let i = 0; i < 5; i++) {
    const el = document.createElement('div');
    el.className = 'floating-heart';
    el.style.left = `${x + (Math.random() - 0.5) * 100}px`;
    el.style.top = `${y}px`;
    el.style.animationDuration = `${Math.random() * 1.5 + 1}s`;
    el.style.animationDelay = `${Math.random() * 0.3}s`;
    el.style.fontSize = `${Math.random() * 1 + 1}rem`;
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2500);
  }
}

export default function ConfettiEffect({ active }: { active: boolean }) {
  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      spawnConfetti(Math.random() * 100);
    }, 400);
    return () => clearInterval(interval);
  }, [active]);

  return null;
}
