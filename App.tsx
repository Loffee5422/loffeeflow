
import React, { useState, useEffect } from 'react';
import { TaskProvider } from './context/TaskContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { WebApp } from './components/WebApp';
import { LandingPage } from './components/LandingPage';
import { PricingPage } from './components/PricingPage';
import { HelpCenter } from './components/HelpCenter';
import { Feedback } from './components/Feedback';
import { ErrorBoundary } from './components/ErrorBoundary';

type Screen = 'landing' | 'app' | 'pricing' | 'help' | 'feedback';

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('landing');

  useEffect(() => {
    const handleUrlChange = () => {
        const hash = window.location.hash.replace('#', '');
        if (['app', 'pricing', 'help', 'feedback'].includes(hash)) {
            setScreen(hash as Screen);
        } else {
            setScreen('landing');
        }
    };
    handleUrlChange();
    window.addEventListener('hashchange', handleUrlChange);
    return () => window.removeEventListener('hashchange', handleUrlChange);
  }, []);

  const navigate = (target: Screen) => {
    setScreen(target);
    window.location.hash = target === 'landing' ? '' : target;
    window.scrollTo(0, 0);
  };

  return (
    <ErrorBoundary>
        <AuthProvider>
            <ThemeProvider>
                <TaskProvider>
                    {screen === 'landing' && <LandingPage onEnter={() => navigate('app')} onNavigate={navigate} />}
                    {screen === 'pricing' && <PricingPage onNavigate={navigate} onEnter={() => navigate('app')} />}
                    {screen === 'help' && <HelpCenter onNavigate={navigate} />}
                    {screen === 'feedback' && <Feedback onNavigate={navigate} />}
                    {screen === 'app' && <WebApp initialView="dashboard" />}
                </TaskProvider>
            </ThemeProvider>
        </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
