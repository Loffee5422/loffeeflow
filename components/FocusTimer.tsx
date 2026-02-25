
import React, { useState, useEffect, useRef } from 'react';
import { useTasks } from '../context/TaskContext';
import { useTheme } from '../context/ThemeContext';
import { Play, Pause, Square, BarChart2, X, RotateCcw, Minus, Plus } from 'lucide-react';

export const FocusTimer: React.FC = () => {
  const { 
      focusSessions,
      timerMode, setTimerMode,
      timerTargetMinutes, setTimerTargetMinutes,
      timerIsActive, toggleTimer, stopTimer,
      timerTimeLeft, timerTimeElapsed
  } = useTasks();
  
  const { t } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 400, h: 400 });
  const [showStats, setShowStats] = useState(false);
  
  // Resize Observer to handle responsiveness (Width AND Height)
  useEffect(() => {
      if (!containerRef.current) return;
      const ro = new ResizeObserver((entries) => {
          for (const entry of entries) {
              setDims({ 
                  w: entry.contentRect.width, 
                  h: entry.contentRect.height 
              });
          }
      });
      ro.observe(containerRef.current);
      return () => ro.disconnect();
  }, []);

  const handleStop = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      stopTimer();
  };

  const handleToggle = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      toggleTimer();
  };

  const formatTimeParts = (ms: number) => {
    if (ms < 0) ms = 0;
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    const centis = Math.floor((ms % 1000) / 10);
    
    const main = h > 0 
        ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
        : `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        
    return { main, ms: centis.toString().padStart(2, '0') };
  };

  // --- STATS LOGIC ---
  const getDailyStats = () => {
      const today = new Date().setHours(0,0,0,0);
      const todaySessions = focusSessions.filter(s => s.completedAt >= today);
      const totalSeconds = todaySessions.reduce((acc, curr) => acc + curr.duration, 0);
      return Math.floor(totalSeconds / 60);
  };

  const displayTime = timerMode === 'TIMER' ? timerTimeLeft : timerTimeElapsed;
  const { main: timeStr, ms: msStr } = formatTimeParts(displayTime);
  const totalDurationMs = timerTargetMinutes * 60 * 1000;

  // --- RESPONSIVE LOGIC ---
  const { w, h } = dims;
  
  const showHeader = h > 240; 
  const showControls = h > 300 && timerMode === 'TIMER'; 
  const hideMs = w < 300;

  // Calculate Fixed Heights of UI Elements to reserve space
  const headerHeight = showHeader ? 64 : 0; 
  const controlsHeight = showControls ? 50 : 0;
  const buttonsHeight = 80; // Large buttons + padding
  const statusHeight = 24; 
  const layoutPadding = 32;

  // Calculate available height for the font
  const availableHeight = Math.max(0, h - (headerHeight + controlsHeight + buttonsHeight + statusHeight + layoutPadding));
  
  // Height-based font limit (divide by ~14px base rem * line-height factor)
  const hBasedSize = availableHeight * 0.9 / 16; 
  
  // Width-based font limit 
  // 00:00:00 is approx 4.5em wide in tracking-tighter mono
  const wBasedSize = (w * 0.85) / 4.5 / 16; 

  const fontSize = Math.max(2, Math.min(hBasedSize, wBasedSize));
  const btnSize = Math.max(48, Math.min(72, h / 6));

  return (
    <div ref={containerRef} className="h-full w-full flex flex-col bg-white dark:bg-slate-900 relative overflow-hidden transition-colors duration-300">
      
      {/* Header Controls */}
      {showHeader && (
      <div className="flex justify-between items-center p-4 z-10 shrink-0 h-16 animate-in fade-in slide-in-from-top-2">
          <div className="flex bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-full backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
              <button 
                onClick={() => setTimerMode('STOPWATCH')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${timerMode === 'STOPWATCH' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'} ${timerIsActive ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {t('timer.count')}
              </button>
              <button 
                onClick={() => setTimerMode('TIMER')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${timerMode === 'TIMER' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'} ${timerIsActive ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {t('timer.timer')}
              </button>
          </div>
          
          <button 
            onClick={() => setShowStats(true)}
            className="p-2 rounded-full bg-slate-100/50 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50"
          >
              <BarChart2 size={16} />
          </button>
      </div>
      )}

      {/* Main Display Area */}
      <div className="flex-1 flex flex-col items-center justify-center z-10 w-full min-h-0">
          
          {/* Time Text */}
          <div 
            className="flex items-baseline justify-center font-mono tracking-tighter tabular-nums leading-none select-none text-slate-800 dark:text-white"
            style={{ fontSize: `${fontSize}rem` }}
          >
              <span className="font-bold">
                  {timeStr}
              </span>
              <span 
                className={`font-bold text-slate-400 dark:text-slate-600 ml-[0.1em] overflow-hidden transition-opacity duration-300`}
                style={{ 
                    fontSize: '0.4em', 
                    width: hideMs ? '0px' : '2ch',
                    opacity: hideMs ? 0 : 1,
                }}
              >
                  {msStr}
              </span>
          </div>

          <p className="text-slate-400 dark:text-slate-500 mt-2 font-medium uppercase tracking-[0.2em] text-[10px] h-6 flex items-center shrink-0">
              {timerIsActive ? (timerMode === 'TIMER' ? <span className="animate-pulse">{t('timer.focusing')}</span> : <span className="animate-pulse">{t('timer.recording')}</span>) : t('timer.ready')}
          </p>

          {/* Time Controls (Timer Mode) */}
          {showControls && (
             <div className="mt-4 shrink-0 flex flex-col items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1 pr-3 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                     <button 
                        disabled={timerIsActive}
                        onClick={() => setTimerTargetMinutes(Math.max(1, timerTargetMinutes - 5))}
                        className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md text-slate-400 dark:text-slate-500 disabled:opacity-30"
                     >
                        <Minus size={14} />
                     </button>
                     <div className="flex items-baseline gap-1 min-w-[3rem] justify-center">
                        <span className={`text-lg font-bold text-slate-800 dark:text-white ${timerIsActive ? 'opacity-50' : ''}`}>{timerTargetMinutes}</span>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">min</span>
                     </div>
                     <button 
                        disabled={timerIsActive}
                        onClick={() => setTimerTargetMinutes(Math.min(180, timerTargetMinutes + 5))}
                        className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md text-slate-400 dark:text-slate-500 disabled:opacity-30"
                     >
                        <Plus size={14} />
                     </button>
                </div>
             </div>
          )}

          {/* Play/Pause Controls - Anchored at bottom of flex area */}
          <div className="mt-6 shrink-0 flex items-center gap-4 pb-4">
            {!timerIsActive && (displayTime !== (timerMode === 'TIMER' ? totalDurationMs : 0)) && (
                <button 
                    onClick={handleStop}
                    className="rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-700 transition-all"
                    style={{ width: btnSize * 0.7, height: btnSize * 0.7 }}
                >
                    <RotateCcw size={btnSize * 0.35} />
                </button>
            )}

            <button 
                onClick={handleToggle}
                className={`rounded-full flex items-center justify-center transition-all shadow-xl hover:scale-105 active:scale-95 ${timerIsActive ? 'bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400' : 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-indigo-200 dark:shadow-indigo-900/30'}`}
                style={{ width: btnSize, height: btnSize }}
            >
                {timerIsActive ? <Pause size={btnSize * 0.4} fill="currentColor" /> : <Play size={btnSize * 0.4} fill="currentColor" className="ml-1" />}
            </button>
            
            {timerIsActive && (
                <button 
                    onClick={handleStop}
                    className="rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center hover:bg-rose-200 dark:hover:bg-rose-900/50 transition-all"
                    style={{ width: btnSize * 0.7, height: btnSize * 0.7 }}
                >
                    <Square size={btnSize * 0.35} fill="currentColor" />
                </button>
            )}
          </div>
      </div>

      {/* Stats Overlay */}
      {showStats && (
          <div className="absolute inset-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-6 animate-in slide-in-from-bottom-10 duration-300 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white">{t('timer.stats')}</h2>
                  <button onClick={() => setShowStats(false)} className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500">
                      <X size={18} />
                  </button>
              </div>

              <div className="space-y-4">
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl">
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">{t('timer.daily_stats')}</p>
                      <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{getDailyStats()} <span className="text-sm text-slate-400 font-normal">min</span></div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                       <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">{t('timer.total_sessions')}</p>
                       <div className="text-2xl font-bold text-slate-800 dark:text-white">{focusSessions.length}</div>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};
