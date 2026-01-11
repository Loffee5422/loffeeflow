
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { Task, TaskStatus, FocusSession, Note, SyncStatus } from '../types';
import { useAuth } from './AuthContext';
import { IRepository, FirestoreRepository, LocalStorageRepository } from '../services/TaskRepository';
import { calculateNextDueDate, generateId } from '../utils/taskUtils';

interface TaskContextType {
  tasks: Task[];
  focusSessions: FocusSession[];
  notes: Note[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;
  getTasksByDate: (date: Date) => Task[];
  logSession: (duration: number, taskId?: string) => void;
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  isCloudSynced: boolean;
  syncStatus: SyncStatus;
  syncError: string | null;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [taskMap, setTaskMap] = useState<Map<string, Task>>(new Map());
  const [notesMap, setNotesMap] = useState<Map<string, Note>>(new Map());
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]); 
  
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('IDLE');
  const [syncError, setSyncError] = useState<string | null>(null);
  const { user } = useAuth();
  
  // Dependency Injection: Select the strategy based on auth state
  const repository = useMemo<IRepository>(() => {
      if (user) return new FirestoreRepository(user.uid);
      return new LocalStorageRepository();
  }, [user]);

  const isCloudSynced = !!user;

  // --- Subscriptions ---
  useEffect(() => {
      setSyncStatus('SYNCING');
      
      const unsubTasks = repository.subscribeToTasks((newTasks) => {
          // Batch convert to Map
          const newMap = new Map(newTasks.map(t => [t.id, t]));
          setTaskMap(newMap);
          setSyncStatus('IDLE');
          setSyncError(null);
      });

      const unsubSessions = repository.subscribeToSessions((newSessions) => {
          setFocusSessions(newSessions.sort((a, b) => b.completedAt - a.completedAt));
      });

      const unsubNotes = repository.subscribeToNotes((newNotes) => {
          setNotesMap(new Map(newNotes.map(n => [n.id, n])));
      });

      return () => {
          unsubTasks();
          unsubSessions();
          unsubNotes();
      };
  }, [repository]);

  // --- Derived State (Memoized for UI consumption) ---
  const tasks = useMemo(() => 
      Array.from(taskMap.values()).sort((a, b) => b.createdAt - a.createdAt), 
  [taskMap]);

  const notes = useMemo(() => 
      Array.from(notesMap.values()).sort((a, b) => b.updatedAt - a.updatedAt), 
  [notesMap]);

  // --- Operations Helper ---
  const performOp = useCallback(async (op: () => Promise<void>) => {
      setSyncStatus('SYNCING');
      setSyncError(null);
      try {
          await op();
          setSyncStatus('SAVED');
          setTimeout(() => setSyncStatus(prev => prev === 'SAVED' ? 'IDLE' : prev), 2000);
      } catch (err: any) {
          console.error(err);
          setSyncStatus('ERROR');
          setSyncError(err.message || "Unknown sync error");
      }
  }, []);

  // --- Domain Logic ---

  const addTask = useCallback((newTask: Omit<Task, 'id' | 'createdAt'>) => {
    const task: Task = {
      ...newTask,
      id: generateId(),
      createdAt: Date.now(),
    };
    performOp(() => repository.saveTask(task));
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
        // Handle Recurrence Logic (Only if dueDate exists)
        if (newStatus === TaskStatus.COMPLETED && task.recurrence && task.dueDate) {
            const nextDate = calculateNextDueDate(task.dueDate, task.recurrence);
            const nextTask: Task = {
                ...task,
                id: generateId(),
                status: TaskStatus.TODO,
                dueDate: nextDate,
                createdAt: Date.now()
            };
            await repository.updateTask(id, { status: newStatus });
            await repository.saveTask(nextTask);
        } else {
            await repository.updateTask(id, { status: newStatus });
        }
    });
  }, [taskMap, repository, performOp]);

  const getTasksByDate = useCallback((date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    // Standard filtering (O(N))
    return Array.from(taskMap.values())
        .filter(task => task.dueDate === dateStr)
        .sort((a, b) => {
            if (a.status === b.status) return b.createdAt - a.createdAt;
            return a.status === TaskStatus.COMPLETED ? 1 : -1;
        });
  }, [taskMap]);

  const logSession = useCallback((duration: number, taskId?: string) => {
      const session: FocusSession = {
          id: generateId(),
          duration,
          completedAt: Date.now(),
          taskId
      };
      performOp(() => repository.saveSession(session));
  }, [repository, performOp]);

  const addNote = useCallback((newNote: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
      const note: Note = {
          ...newNote,
          id: generateId(),
          createdAt: Date.now(),
          updatedAt: Date.now()
      };
      performOp(() => repository.saveNote(note));
  }, [repository, performOp]);

  const updateNote = useCallback((id: string, updates: Partial<Note>) => {
      const updatedFields = { ...updates, updatedAt: Date.now() };
      performOp(() => repository.updateNote(id, updatedFields));
  }, [repository, performOp]);

  const deleteNote = useCallback((id: string) => {
      performOp(() => repository.deleteNote(id));
  }, [repository, performOp]);

  const contextValue = useMemo(() => ({
    tasks, 
    focusSessions,
    notes,
    addTask, 
    updateTask, 
    deleteTask, 
    toggleTaskStatus, 
    getTasksByDate, 
    logSession,
    addNote,
    updateNote,
    deleteNote,
    isCloudSynced,
    syncStatus,
    syncError
  }), [tasks, focusSessions, notes, addTask, updateTask, deleteTask, toggleTaskStatus, getTasksByDate, logSession, addNote, updateNote, deleteNote, isCloudSynced, syncStatus, syncError]);

  return (
    <TaskContext.Provider value={contextValue}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
