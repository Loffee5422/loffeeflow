
import React, { useState, useEffect } from 'react';
import { Layout } from './Layout';
import { Dashboard } from './Dashboard';
import { CalendarView } from './CalendarView';
import { FocusTimer } from './FocusTimer';
import { View } from '../types';

interface WebAppProps {
    initialView?: View;
}

export const WebApp: React.FC<WebAppProps> = ({ initialView = 'dashboard' }) => {
  const [currentView, setCurrentView] = useState<View>(initialView);

  useEffect(() => {
    if (initialView) setCurrentView(initialView);
  }, [initialView]);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'calendar': return <CalendarView />;
      case 'focus': return <FocusTimer />;
      case 'timeline': return <CalendarView />; // Fallback if old link
      default: return <Dashboard />;
    }
  };

  return (
    <Layout currentView={currentView} setCurrentView={setCurrentView}>
        {renderView()}
    </Layout>
  );
};
