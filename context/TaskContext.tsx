
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo, useRef } from 'react';
import { Task, TaskStatus, FocusSession, SyncStatus, Note } from '../types';
import { useAuth } from './AuthContext';
import { IRepository, FirestoreRepository, LocalStorageRepository } from '../services/TaskRepository';
import { calculateNextDueDate, generateId } from '../utils/taskUtils';

type TimerMode = 'TIMER' | 'STOPWATCH';

interface TaskContextType {
  tasks: Task[];
  focusSessions: FocusSession[];
  notes: Note[];
  
  // Task Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => string;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;
  getTasksByDate: (date: Date) => Task[];
  
  // Session/Note Actions
  logSession: (duration: number, taskId?: string) => void;
  addNote: (note: Omit<Note, 'id' | 'updatedAt'>) => string;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  
  // Sync State
  isCloudSynced: boolean;
  syncStatus: SyncStatus;
  syncError: string | null;

  // Global Timer State
  timerMode: TimerMode;
  setTimerMode: (mode: TimerMode) => void;
  timerTargetMinutes: number;
  setTimerTargetMinutes: (min: number) => void;
  timerIsActive: boolean;
  toggleTimer: () => void;
  stopTimer: () => void;
  timerTimeLeft: number; // For Timer Mode
  timerTimeElapsed: number; // For Stopwatch Mode
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [taskMap, setTaskMap] = useState<Map<string, Task>>(new Map());
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]); 
  const [notes, setNotes] = useState<Note[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('IDLE');
  const [syncError, setSyncError] = useState<string | null>(null);
  const { user } = useAuth();
  
  // --- TIMER STATE ---
  const [timerMode, setTimerModeState] = useState<TimerMode>('STOPWATCH');
  const [timerTargetMinutes, setTimerTargetMinutes] = useState(25);
  const [timerIsActive, setTimerIsActive] = useState(false);
  
  // We use Refs for timestamps to ensure accuracy regardless of render cycles
  const timerStartTimeRef = useRef<number | null>(null); // For Stopwatch
  const timerEndTimeRef = useRef<number | null>(null);   // For Countdown
  const timerSavedTimeRef = useRef<number>(0);           // For Paused State
  
  // These are for UI consumption
  const [timerTimeLeft, setTimerTimeLeft] = useState(25 * 60 * 1000);
  const [timerTimeElapsed, setTimerTimeElapsed] = useState(0);

  const repository = useMemo<IRepository>(() => {
      if (user) return new FirestoreRepository(user.uid);
      return new LocalStorageRepository();
  }, [user]);

  const isCloudSynced = !!user;

  // --- DATA SYNC EFFECTS ---
  useEffect(() => {
      setSyncStatus('SYNCING');
      const unsubTasks = repository.subscribeToTasks((newTasks) => {
          setTaskMap(new Map(newTasks.map(t => [t.id, t])));
          setSyncStatus('IDLE');
          setSyncError(null);
      });
      const unsubSessions = repository.subscribeToSessions((newSessions) => {
          setFocusSessions(newSessions.sort((a, b) => b.completedAt - a.completedAt));
      });
      const unsubNotes = repository.subscribeToNotes((newNotes) => {
          setNotes(newNotes.sort((a, b) => b.updatedAt - a.updatedAt));
      });
      return () => {
          unsubTasks();
          unsubSessions();
          unsubNotes();
      };
  }, [repository]);

  // --- TIMER LOGIC ---

  const performOp = useCallback(async (op: () => Promise<void>) => {
      setSyncStatus('SYNCING');
      setSyncError(null);
      try {
          await op();
          setSyncStatus('SAVED');
          setTimeout(() => setSyncStatus(prev => prev === 'SAVED' ? 'IDLE' : prev), 2000);
      } catch (err: any) {
          setSyncStatus('ERROR');
          setSyncError(err.message || "Unknown sync error");
      }
  }, []);

  const logSession = useCallback((duration: number, taskId?: string) => {
      const session: FocusSession = { id: generateId(), duration, completedAt: Date.now(), taskId };
      performOp(() => repository.saveSession(session));
  }, [repository, performOp]);

  // Handle Timer Ticking (Global)
  useEffect(() => {
    let interval: number;

    if (timerIsActive) {
        // Initialize timestamps if just started
        if (timerMode === 'TIMER' && !timerEndTimeRef.current) {
            timerEndTimeRef.current = Date.now() + (timerSavedTimeRef.current || (timerTargetMinutes * 60 * 1000));
        } else if (timerMode === 'STOPWATCH' && !timerStartTimeRef.current) {
            timerStartTimeRef.current = Date.now() - timerSavedTimeRef.current;
        }

        interval = window.setInterval(() => {
            if (timerMode === 'TIMER') {
                if (timerEndTimeRef.current) {
                    const remaining = timerEndTimeRef.current - Date.now();
                    if (remaining <= 0) {
                        // Timer Finished
                        setTimerTimeLeft(0);
                        setTimerIsActive(false);
                        logSession(timerTargetMinutes * 60, undefined);
                        timerEndTimeRef.current = null;
                        timerSavedTimeRef.current = timerTargetMinutes * 60 * 1000;
                        setTimerTimeLeft(timerTargetMinutes * 60 * 1000);
                        // Optional: Play sound or notification here
                    } else {
                        setTimerTimeLeft(remaining);
                    }
                }
            } else {
                if (timerStartTimeRef.current) {
                    setTimerTimeElapsed(Date.now() - timerStartTimeRef.current);
                }
            }
        }, 50); // 50ms resolution
    } else {
        // If paused or stopped
        if (timerMode === 'TIMER') {
             // If we just paused (timer was active but now false, and we have an end time)
             // We need to save the remaining time to savedTimeRef
             // However, handling this inside the effect dependency array is tricky.
             // We handle pause logic in toggleTimer instead.
        }
    }

    return () => clearInterval(interval);
  }, [timerIsActive, timerMode, timerTargetMinutes, logSession]);

  // Reset TimeLeft when target changes (only if not active)
  useEffect(() => {
      if (!timerIsActive && timerMode === 'TIMER') {
          setTimerTimeLeft(timerTargetMinutes * 60 * 1000);
          timerSavedTimeRef.current = timerTargetMinutes * 60 * 1000;
      }
  }, [timerTargetMinutes, timerIsActive, timerMode]);

  const toggleTimer = useCallback(() => {
      if (timerIsActive) {
          // PAUSE
          setTimerIsActive(false);
          if (timerMode === 'TIMER') {
              timerSavedTimeRef.current = timerTimeLeft;
              timerEndTimeRef.current = null;
          } else {
              timerSavedTimeRef.current = timerTimeElapsed;
              timerStartTimeRef.current = null;
          }
      } else {
          // START
          setTimerIsActive(true);
      }
  }, [timerIsActive, timerMode, timerTimeLeft, timerTimeElapsed]);

  const stopTimer = useCallback(() => {
      setTimerIsActive(false);
      
      // Log session if significant time passed
      const maxTime = timerTargetMinutes * 60 * 1000;
      const durationMs = timerMode === 'TIMER' ? (maxTime - timerTimeLeft) : timerTimeElapsed;
      const durationSec = Math.floor(durationMs / 1000);
      
      if (durationSec > 60) logSession(durationSec, undefined);

      // Reset Refs
      timerEndTimeRef.current = null;
      timerStartTimeRef.current = null;
      
      // Reset State
      setTimerTimeLeft(timerTargetMinutes * 60 * 1000);
      setTimerTimeElapsed(0);
      timerSavedTimeRef.current = timerMode === 'TIMER' ? (timerTargetMinutes * 60 * 1000) : 0;
  }, [timerMode, timerTargetMinutes, timerTimeLeft, timerTimeElapsed, logSession]);

  const setTimerMode = useCallback((mode: TimerMode) => {
      if (timerIsActive) return; // Prevent switch while running
      setTimerModeState(mode);
      
      // Reset logic for new mode
      setTimerTimeElapsed(0);
      const newTime = timerTargetMinutes * 60 * 1000;
      setTimerTimeLeft(newTime);
      timerSavedTimeRef.current = mode === 'TIMER' ? newTime : 0;
      timerEndTimeRef.current = null;
      timerStartTimeRef.current = null;
  }, [timerIsActive, timerTargetMinutes]);


  // --- TASK LOGIC ---

  const tasks = useMemo(() => 
      Array.from<Task>(taskMap.values()).sort((a, b) => b.createdAt - a.createdAt), 
  [taskMap]);

  const addTask = useCallback((newTask: Omit<Task, 'id' | 'createdAt'>) => {
    const id = generateId();
    const task: Task = { ...newTask, id, createdAt: Date.now() };
    performOp(() => repository.saveTask(task));
    return id;
  }, [repository, performOp]);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    performOp(() => repository.updateTask(id, updates));
  }, [repository, performOp]);

  const deleteTask = useCallback((id: string) => {
    performOp(() => repository.deleteTask(id));
  }, [repository, performOp]);

  const toggleTaskStatus = useCallback((id: string) => {
    const task = taskMap.get(id);
    if (!task) return;
    const newStatus = task.status === TaskStatus.COMPLETED ? TaskStatus.TODO : TaskStatus.COMPLETED;
    performOp(async () => {
        if (newStatus === TaskStatus.COMPLETED && task.recurrence && task.dueDate) {
            const nextDate = calculateNextDueDate(task.dueDate, task.recurrence);
            const nextTask: Task = { ...task, id: generateId(), status: TaskStatus.TODO, dueDate: nextDate, createdAt: Date.now() };
            await repository.updateTask(id, { status: newStatus });
            await repository.saveTask(nextTask);
        } else {
            await repository.updateTask(id, { status: newStatus });
        }
    });
  }, [taskMap, repository, performOp]);

  const getTasksByDate = useCallback((date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return Array.from<Task>(taskMap.values())
        .filter((task: Task) => task.dueDate === dateStr)
        .sort((a, b) => (a.status === b.status) ? b.createdAt - a.createdAt : (a.status === TaskStatus.COMPLETED ? 1 : -1));
  }, [taskMap]);

  const addNote = useCallback((newNote: Omit<Note, 'id' | 'updatedAt'>) => {
    const id = generateId();
    const note: Note = { ...newNote, id, updatedAt: Date.now() };
    performOp(() => repository.saveNote(note));
    return id;
  }, [repository, performOp]);

  const updateNote = useCallback((id: string, updates: Partial<Note>) => {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    const updatedNote: Note = { ...note, ...updates, updatedAt: Date.now() };
    performOp(() => repository.updateNote(id, updatedNote));
  }, [notes, repository, performOp]);

  const deleteNote = useCallback((id: string) => {
    performOp(() => repository.deleteNote(id));
  }, [repository, performOp]);

  return (
    <TaskContext.Provider value={{ 
        tasks, focusSessions, notes, addTask, updateTask, deleteTask, toggleTaskStatus, 
        getTasksByDate, logSession, addNote, updateNote, deleteNote, isCloudSynced, syncStatus, syncError,
        // Timer Exports
        timerMode, setTimerMode,
        timerTargetMinutes, setTimerTargetMinutes,
        timerIsActive, toggleTimer, stopTimer,
        timerTimeLeft, timerTimeElapsed
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) throw new Error('useTasks must be used within a TaskProvider');
  return context;
};
