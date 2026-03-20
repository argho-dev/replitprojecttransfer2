import { useState, useEffect, lazy, Suspense } from 'react';
import { isBirthday, isBirthdayEve } from './lib/surprises';
import Entry from './pages/Entry';
import AccessGate from './components/AccessGate';

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
  const [screen, setScreen] = useState<Screen>('gate');

  const handleAccessGranted = () => {
    setScreen('entry');
  };

  const handleContinue = () => {
    if (isBirthday()) {
      // Birthday: go through the interactive cake first, then finale
      setScreen('cake');
    } else if (isBirthdayEve()) {
      setScreen('cake');
    } else {
      setScreen('surprise');
    }
  };

  useEffect(() => {
    const link = document.createElement('link');
    link.rel   = 'stylesheet';
    link.href  = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&display=swap';
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

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
          <DailySurprise />
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
    </div>
  );
}
