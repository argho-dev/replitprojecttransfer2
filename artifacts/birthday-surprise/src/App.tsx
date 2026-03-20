import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { isBirthday, isBirthdayEve, isBirthdayFinalDay } from './lib/surprises';
import Entry from './pages/Entry';
import AccessGate from './components/AccessGate';
import MusicPlayer from './components/MusicPlayer';

const DailySurprise  = lazy(() => import('./pages/DailySurprise'));
const BirthdayCake   = lazy(() => import('./components/BirthdayCake'));
const BirthdayFinale = lazy(() => import('./components/BirthdayFinale'));

type Screen = 'gate' | 'entry' | 'surprise' | 'cake' | 'finale';

function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#000' }}>
      <div className="text-6xl heartbeat" style={{ filter: 'drop-shadow(0 0 20px #ff79c6)' }}>
        💖
      </div>
    </div>
  );
}

export default function App() {
  const previewParam = new URLSearchParams(window.location.search).get('preview');
  const initialScreen: Screen = previewParam === 'finale' ? 'finale'
    : previewParam === 'cake' ? 'cake'
    : 'gate';

  const [screen, setScreen] = useState<Screen>(initialScreen);
  const cakeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleAccessGranted = () => {
    setScreen('entry');
  };

  const handleContinue = () => {
    if (isBirthdayFinalDay()) {
      // Birthday: go through the scratch page first, then auto-navigate to cake after scratch
      setScreen('surprise');
    } else if (isBirthdayEve()) {
      setScreen('cake');
    } else {
      setScreen('surprise');
    }
  };

  const handleGoToCake = () => {
    if (!isBirthdayFinalDay()) return;
    if (cakeTimerRef.current) return;
    cakeTimerRef.current = setTimeout(() => {
      setScreen('cake');
      cakeTimerRef.current = null;
    }, 3000);
  };

  useEffect(() => {
    const link = document.createElement('link');
    link.rel   = 'stylesheet';
    link.href  = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&display=swap';
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  const showMusic = screen === 'surprise' || screen === 'cake' || screen === 'finale';

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: '#000' }}>
      {screen === 'gate' && (
        <AccessGate onGranted={handleAccessGranted} />
      )}

      {screen === 'entry' && (
        <Entry onContinue={handleContinue} />
      )}

      {screen === 'surprise' && (
        <Suspense fallback={<LoadingScreen />}>
          <DailySurprise onGoToCake={handleGoToCake} />
        </Suspense>
      )}

      {screen === 'cake' && (
        <Suspense fallback={<LoadingScreen />}>
          <BirthdayCake onDone={() => setScreen('finale')} />
        </Suspense>
      )}

      {screen === 'finale' && (
        <Suspense fallback={<LoadingScreen />}>
          <BirthdayFinale />
        </Suspense>
      )}

      {showMusic && <MusicPlayer />}
    </div>
  );
}
