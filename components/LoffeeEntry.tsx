import React from 'react';
import { TaskProvider } from '../context/TaskContext';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { WebApp } from './WebApp';

interface LoffeeEntryProps {
  onBack: () => void;
}

export const LoffeeEntry: React.FC<LoffeeEntryProps> = ({ onBack }) => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <TaskProvider>
          <button
            onClick={onBack}
            className="fixed top-4 right-4 z-50 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:opacity-90"
          >
            Back to CV
          </button>
          <WebApp initialView="dashboard" />
        </TaskProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};
