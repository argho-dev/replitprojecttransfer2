import { useState, useEffect } from 'react';

export default function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');
  const h = pad(time.getHours());
  const m = pad(time.getMinutes());
  const s = pad(time.getSeconds());

  return (
    <div className="clock-display select-none">
      <span>{h}</span>
      <span style={{ animation: 'blink 1s ease infinite', color: '#ff79c6', margin: '0 4px' }}>:</span>
      <span>{m}</span>
      <span style={{ animation: 'blink 1s ease infinite', color: '#ff79c6', margin: '0 4px' }}>:</span>
      <span>{s}</span>
    </div>
  );
}
