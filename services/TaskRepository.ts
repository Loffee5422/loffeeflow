
import { Task, FocusSession, Note } from '../types';
import { db } from './firebase';
import { 
    collection, 
    query, 
    onSnapshot, 
    doc, 
    setDoc, 
    deleteDoc, 
    updateDoc,
    Unsubscribe
} from 'firebase/firestore';

/**
 * Domain-Driven Design: The Repository Interface.
 */
export interface IRepository {
    subscribeToTasks(callback: (tasks: Task[]) => void): () => void;
    subscribeToSessions(callback: (sessions: FocusSession[]) => void): () => void;
    subscribeToNotes(callback: (notes: Note[]) => void): () => void;

    saveTask(task: Task): Promise<void>;
    updateTask(id: string, updates: Partial<Task>): Promise<void>;
    deleteTask(id: string): Promise<void>;

    saveSession(session: FocusSession): Promise<void>;
    
    saveNote(note: Note): Promise<void>;
    updateNote(id: string, updates: Partial<Note>): Promise<void>;
    deleteNote(id: string): Promise<void>;
}

const LOCAL_STORAGE_KEYS = {
    TASKS: 'flowstate_tasks_v1',
    SESSIONS: 'flowstate_sessions_v1',
    NOTES: 'flowstate_notes_v1',
};

/**
 * Helper to remove undefined values which Firestore rejects.
 * It also strips functions and symbols, leaving only JSON-safe data.
 */
const sanitize = <T>(data: T): T => {
    return JSON.parse(JSON.stringify(data));
};

/**
 * Infrastructure: LocalStorage Implementation.
 * Includes internal event emitter for same-tab reactivity.
 */
export class LocalStorageRepository implements IRepository {
    // Internal subscribers map to handle same-tab updates
    private subscribers: Map<string, Set<(data: any) => void>> = new Map();

    private load<T>(key: string): T[] {
        try {
            return JSON.parse(localStorage.getItem(key) || '[]');
        } catch {
            return [];
        }
    }

    private save<T>(key: string, data: T[]) {
        localStorage.setItem(key, JSON.stringify(data));
        this.notifySubscribers(key, data);
    }

    private notifySubscribers(key: string, data: any) {
        if (this.subscribers.has(key)) {
            this.subscribers.get(key)!.forEach(cb => cb(data));
        }
    }

    private createSubscription<T>(key: string, callback: (data: T[]) => void): () => void {
        // Register subscriber
        if (!this.subscribers.has(key)) {
            this.subscribers.set(key, new Set());
        }
        this.subscribers.get(key)!.add(callback as any);

        // Initial load
        callback(this.load<T>(key));

        // Listen for storage events (multi-tab support)
        const storageHandler = (e: StorageEvent) => {
            if (e.key === key) {
                callback(this.load<T>(key));
            }
        };
        window.addEventListener('storage', storageHandler);

        return () => {
            this.subscribers.get(key)?.delete(callback as any);
            window.removeEventListener('storage', storageHandler);
        };
    }

    subscribeToTasks(callback: (tasks: Task[]) => void) {
        return this.createSubscription(LOCAL_STORAGE_KEYS.TASKS, callback);
    }
    subscribeToSessions(callback: (sessions: FocusSession[]) => void) {
        return this.createSubscription(LOCAL_STORAGE_KEYS.SESSIONS, callback);
    }
    subscribeToNotes(callback: (notes: Note[]) => void) {
        return this.createSubscription(LOCAL_STORAGE_KEYS.NOTES, callback);
    }

    async saveTask(task: Task) {
        const tasks = this.load<Task>(LOCAL_STORAGE_KEYS.TASKS);
        this.save(LOCAL_STORAGE_KEYS.TASKS, [task, ...tasks]);
    }

    async updateTask(id: string, updates: Partial<Task>) {
        const tasks = this.load<Task>(LOCAL_STORAGE_KEYS.TASKS);
        const newTasks = tasks.map(t => t.id === id ? { ...t, ...updates } : t);
        this.save(LOCAL_STORAGE_KEYS.TASKS, newTasks);
    }

    async deleteTask(id: string) {
        const tasks = this.load<Task>(LOCAL_STORAGE_KEYS.TASKS);
        this.save(LOCAL_STORAGE_KEYS.TASKS, tasks.filter(t => t.id !== id));
    }

    async saveSession(session: FocusSession) {
        const sessions = this.load<FocusSession>(LOCAL_STORAGE_KEYS.SESSIONS);
        this.save(LOCAL_STORAGE_KEYS.SESSIONS, [session, ...sessions]);
    }

    async saveNote(note: Note) {
        const notes = this.load<Note>(LOCAL_STORAGE_KEYS.NOTES);
        this.save(LOCAL_STORAGE_KEYS.NOTES, [note, ...notes]);
    }

    async updateNote(id: string, updates: Partial<Note>) {
        const notes = this.load<Note>(LOCAL_STORAGE_KEYS.NOTES);
        this.save(LOCAL_STORAGE_KEYS.NOTES, notes.map(n => n.id === id ? { ...n, ...updates } : n));
    }

    async deleteNote(id: string) {
        const notes = this.load<Note>(LOCAL_STORAGE_KEYS.NOTES);
        this.save(LOCAL_STORAGE_KEYS.NOTES, notes.filter(n => n.id !== id));
    }
}

/**
 * Infrastructure: Firestore Implementation.
 */
export class FirestoreRepository implements IRepository {
    constructor(private userId: string) {}

    subscribeToTasks(callback: (tasks: Task[]) => void): Unsubscribe {
        const q = query(collection(db, "users", this.userId, "tasks"));
        return onSnapshot(q, (snapshot) => {
            const tasks: Task[] = [];
            snapshot.forEach((doc) => tasks.push(doc.data() as Task));
            callback(tasks);
        });
    }

    subscribeToSessions(callback: (sessions: FocusSession[]) => void): Unsubscribe {
        const q = query(collection(db, "users", this.userId, "focusSessions"));
        return onSnapshot(q, (snapshot) => {
            const sessions: FocusSession[] = [];
            snapshot.forEach((doc) => sessions.push(doc.data() as FocusSession));
            callback(sessions);
        });
    }

    subscribeToNotes(callback: (notes: Note[]) => void): Unsubscribe {
        const q = query(collection(db, "users", this.userId, "notes"));
        return onSnapshot(q, (snapshot) => {
            const notes: Note[] = [];
            snapshot.forEach((doc) => notes.push(doc.data() as Note));
            callback(notes);
        });
    }

    async saveTask(task: Task) {
        // Sanitize removes 'undefined' values which cause Firestore to crash
        await setDoc(doc(db, "users", this.userId, "tasks", task.id), sanitize(task));
    }

    async updateTask(id: string, updates: Partial<Task>) {
        await updateDoc(doc(db, "users", this.userId, "tasks", id), sanitize(updates));
    }

    async deleteTask(id: string) {
        await deleteDoc(doc(db, "users", this.userId, "tasks", id));
    }

    async saveSession(session: FocusSession) {
        await setDoc(doc(db, "users", this.userId, "focusSessions", session.id), sanitize(session));
    }

    async saveNote(note: Note) {
        await setDoc(doc(db, "users", this.userId, "notes", note.id), sanitize(note));
    }

    async updateNote(id: string, updates: Partial<Note>) {
        await updateDoc(doc(db, "users", this.userId, "notes", id), sanitize(updates));
    }

    async deleteNote(id: string) {
        await deleteDoc(doc(db, "users", this.userId, "notes", id));
    }
}
