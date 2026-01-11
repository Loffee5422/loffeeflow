

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export type RecurrenceType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface RecurrenceConfig {
  type: RecurrenceType;
  interval: number; // e.g., 1 for every day, 2 for every other day
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  subtasks?: SubTask[]; // Recursive nesting
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  starLevel: number; // 0 (None), 1 (Important)
  dueDate?: string; // ISO Date string (Optional)
  estimatedMinutes?: number;
  tags?: string[];
  createdAt: number;
  recurrence?: RecurrenceConfig;
  subtasks?: SubTask[];
  order?: number; // Manual ordering rank
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface FocusSession {
  id: string;
  duration: number; // in seconds
  completedAt: number; // timestamp
  taskId?: string; // Optional link to a task
}

export type View = 'dashboard' | 'calendar' | 'focus' | 'journal' | 'map' | 'settings';

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  tasks: Task[];
}

export type SyncStatus = 'IDLE' | 'SYNCING' | 'SAVED' | 'ERROR';
