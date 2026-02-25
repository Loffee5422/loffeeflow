
export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export type RecurrenceType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface RecurrenceConfig {
  type: RecurrenceType;
  interval: number;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  subtasks?: SubTask[];
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  starLevel: number; // 0 (None), 1 (Important)
  dueDate?: string; // ISO Format YYYY-MM-DD
  estimatedMinutes?: number;
  tags?: string[];
  createdAt: number;
  recurrence?: RecurrenceConfig;
  subtasks?: SubTask[];
  order?: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}

export interface FocusSession {
  id: string;
  duration: number; // in seconds
  completedAt: number; // timestamp
  taskId?: string;
}

export type View = 'dashboard' | 'calendar' | 'focus' | 'timeline' | 'settings';

export type SyncStatus = 'IDLE' | 'SYNCING' | 'SAVED' | 'ERROR';