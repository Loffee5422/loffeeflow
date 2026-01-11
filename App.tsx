import React, { useState } from 'react';
import { TaskProvider } from './context/TaskContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { WebApp } from './components/WebApp';
import { LandingPage } from './components/LandingPage';
import { HomeHub } from './components/HomeHub';
import { Brainstorm } from './components/Brainstorm';
import { Storage } from './components/Storage';
import { MiniTools } from './components/MiniTools';
import { ErrorBoundary } from './components/ErrorBoundary';

type Screen = 'landing' | 'hub' | 'focus' | 'brainstorm' | 'storage' | 'tools';

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('landing');

  return (
    <ErrorBoundary>
        <AuthProvider>
            <ThemeProvider>
                <TaskProvider>
                    {screen === 'landing' && (
                        <LandingPage onEnter={() => setScreen('hub')} />
                    )}
                    {screen === 'hub' && (
                        <HomeHub 
                            onLaunchApp={(appId) => setScreen(appId)} 
                            onBack={() => setScreen('landing')}
                        />
                    )}
                    {screen === 'focus' && (
                        <WebApp onExit={() => setScreen('hub')} />
                    )}
                    {screen === 'brainstorm' && (
                        <Brainstorm onExit={() => setScreen('hub')} />
                    )}
                    {screen === 'storage' && (
                        <Storage onExit={() => setScreen('hub')} />
                    )}
                    {screen === 'tools' && (
                        <MiniTools onExit={() => setScreen('hub')} />
                    )}
                </TaskProvider>
            </ThemeProvider>
        </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;