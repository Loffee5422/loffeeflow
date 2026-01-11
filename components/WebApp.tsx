import React, { useState } from 'react';
import { Layout } from './Layout';
import { Dashboard } from './Dashboard';
import { CalendarView } from './CalendarView';
import { FocusTimer } from './FocusTimer';
import { Journal } from './Journal';
import { TaskMap } from './TaskMap';
import { View } from '../types';

interface WebAppProps {
    onExit: () => void;
}

export const WebApp: React.FC<WebAppProps> = ({ onExit }) => {
  const [currentView, setCurrentView] = useState<View>('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'calendar':
        return <CalendarView />;
      case 'focus':
        return <FocusTimer />;
      case 'journal':
        return <Journal />;
      case 'map':
        return <TaskMap />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout 
        currentView={currentView} 
        setCurrentView={setCurrentView}
        onExit={onExit}
    >
        {renderView()}
    </Layout>
  );
};