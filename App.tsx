
import React, { lazy, Suspense, useState, useEffect } from 'react';
import { PersonalCVPage } from './components/PersonalCVPage';
import { ErrorBoundary } from './components/ErrorBoundary';

type Screen = 'cv' | 'loffee';

const LoffeeEntry = lazy(() => import('./components/LoffeeEntry').then(module => ({ default: module.LoffeeEntry })));

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('cv');

  useEffect(() => {
    const handleUrlChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'loffee') {
        setScreen('loffee');
      } else {
        setScreen('cv');
      }
    };
    handleUrlChange();
    window.addEventListener('hashchange', handleUrlChange);
    return () => window.removeEventListener('hashchange', handleUrlChange);
  }, []);

  const navigate = (target: Screen) => {
    setScreen(target);
    window.location.hash = target === 'cv' ? 'cv' : 'loffee';
    window.scrollTo(0, 0);
  };

  return (
    <ErrorBoundary>
      {screen === 'cv' && <PersonalCVPage onNavigate={navigate} />}
      {screen === 'loffee' && (
        <Suspense fallback={<div className="min-h-screen bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-300 flex items-center justify-center">Loading Loffee Focus...</div>}>
          <LoffeeEntry onBack={() => navigate('cv')} />
        </Suspense>
      )}
    </ErrorBoundary>
  );
};

export default App;
