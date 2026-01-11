
import { SubTask, RecurrenceConfig } from '../types';

export const generateId = (): string => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const calculateNextDueDate = (currentDueDate: string, recurrence: RecurrenceConfig): string => {
    const [y, m, d] = currentDueDate.split('-').map(Number);
    const date = new Date(y, m - 1, d); 
    const { type, interval } = recurrence;
    
    switch (type) {
        case 'DAILY': date.setDate(date.getDate() + interval); break;
        case 'WEEKLY': date.setDate(date.getDate() + (interval * 7)); break;
        case 'MONTHLY': date.setMonth(date.getMonth() + interval); break;
        case 'YEARLY': date.setFullYear(date.getFullYear() + interval); break;
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// --- TREE MANIPULATION HELPERS ---

export const countSubtasks = (items: SubTask[]): { total: number, completed: number } => {
    let total = 0;
    let completed = 0;
    for (const item of items) {
        total++;
        if (item.completed) completed++;
        if (item.subtasks) {
            const res = countSubtasks(item.subtasks);
            total += res.total;
            completed += res.completed;
        }
    }
    return { total, completed };
};

/**
 * Updates a specific node in the tree
 */
export const updateSubtaskInTree = (items: SubTask[], targetId: string, update: Partial<SubTask>): SubTask[] => {
    return items.map(item => {
        if (item.id === targetId) return { ...item, ...update };
        if (item.subtasks?.length) return { ...item, subtasks: updateSubtaskInTree(item.subtasks, targetId, update) };
        return item;
    });
};

/**
 * Toggles completed status of a subtask deep in the tree
 */
export const toggleSubtaskInTree = (items: SubTask[], targetId: string): SubTask[] => {
    return items.map(item => {
        if (item.id === targetId) return { ...item, completed: !item.completed };
        if (item.subtasks?.length) return { ...item, subtasks: toggleSubtaskInTree(item.subtasks, targetId) };
        return item;
    });
};

/**
 * Adds a subtask to a specific parent
 */
export const addSubtaskToParent = (items: SubTask[], parentId: string, newSubtask: SubTask): SubTask[] => {
    return items.map(item => {
        if (item.id === parentId) {
            return { ...item, subtasks: [...(item.subtasks || []), newSubtask] };
        }
        if (item.subtasks?.length) {
            return { ...item, subtasks: addSubtaskToParent(item.subtasks, parentId, newSubtask) };
        }
        return item;
    });
};

/**
 * Deletes a node from the tree
 */
export const deleteSubtaskFromTree = (items: SubTask[], targetId: string): SubTask[] => {
    return items
        .filter(item => item.id !== targetId)
        .map(item => {
            if (item.subtasks?.length) return { ...item, subtasks: deleteSubtaskFromTree(item.subtasks, targetId) };
            return item;
        });
};

/**
 * Inserts a new task immediately after a specific target ID (Sibling insertion)
 */
export const insertSiblingAfter = (items: SubTask[], targetId: string, newTitle: string = ""): { newTree: SubTask[], newId: string } => {
    const newId = generateId();
    const newNode: SubTask = { id: newId, title: newTitle, completed: false };
    
    const recursiveInsert = (list: SubTask[]): SubTask[] => {
        const index = list.findIndex(i => i.id === targetId);
        if (index !== -1) {
            // Found it in this list, insert after
            const newList = [...list];
            newList.splice(index + 1, 0, newNode);
            return newList;
        }
        // Not found, check children
        return list.map(item => {
            if (item.subtasks && item.subtasks.length > 0) {
                return { ...item, subtasks: recursiveInsert(item.subtasks) };
            }
            return item;
        });
    };

    return { newTree: recursiveInsert(items), newId };
};

/**
 * Indent: Moves a task into the subtasks of its previous sibling.
 */
export const indentSubtask = (items: SubTask[], targetId: string): SubTask[] => {
    let nodeToMove: SubTask | null = null;

    // Helper 1: Find and remove the node
    const removeNode = (list: SubTask[]): SubTask[] => {
        const index = list.findIndex(i => i.id === targetId);
        if (index !== -1) {
            nodeToMove = list[index];
            return list.filter(i => i.id !== targetId);
        }
        return list.map(item => {
            if (item.subtasks) return { ...item, subtasks: removeNode(item.subtasks) };
            return item;
        });
    };

    // Helper 2: Find the NEW parent (the sibling just before where the node WAS)
    const moveLogic = (list: SubTask[]): SubTask[] => {
        const index = list.findIndex(i => i.id === targetId);
        if (index > 0) {
            // It has a previous sibling!
            const node = list[index];
            const prevSibling = list[index - 1];
            
            const newPrevSibling = {
                ...prevSibling,
                subtasks: [...(prevSibling.subtasks || []), node]
            };
            
            const newList = [...list];
            newList.splice(index - 1, 2, newPrevSibling); // Remove both, insert updated prev
            return newList;
        }
        
        // If index is 0 or -1, we can't indent here. Try children.
        return list.map(item => {
            if (item.subtasks) return { ...item, subtasks: moveLogic(item.subtasks) };
            return item;
        });
    };

    return moveLogic(items);
};

/**
 * Outdent: Moves a task out of its current parent, becoming a sibling of the parent.
 */
export const outdentSubtask = (items: SubTask[], targetId: string): SubTask[] => {
    // We need to find the parent of the target node
    
    const recursiveOutdent = (list: SubTask[]): SubTask[] => {
        // Check if any of these items HAVE the target as a child
        for (let i = 0; i < list.length; i++) {
            const parent = list[i];
            if (parent.subtasks) {
                const childIndex = parent.subtasks.findIndex(c => c.id === targetId);
                if (childIndex !== -1) {
                    // Found the parent!
                    const child = parent.subtasks[childIndex];
                    
                    // 1. Remove child from parent
                    const newSubtasks = [...parent.subtasks];
                    newSubtasks.splice(childIndex, 1);
                    const newParent = { ...parent, subtasks: newSubtasks };
                    
                    // 2. Insert child after parent in the CURRENT list
                    const newList = [...list];
                    newList.splice(i, 1, newParent); // Update parent
                    newList.splice(i + 1, 0, child); // Insert child after parent
                    
                    return newList;
                }
                
                // Keep searching deeper
                const result = recursiveOutdent(parent.subtasks);
                if (result !== parent.subtasks) {
                    // A change occurred deeper down
                    const newList = [...list];
                    newList[i] = { ...parent, subtasks: result };
                    return newList;
                }
            }
        }
        return list;
    };

    return recursiveOutdent(items);
};

/**
 * Finds the ID of the node visually preceding the target node (DFS order).
 */
export const findPredecessor = (items: SubTask[], targetId: string): string | null => {
    const flat: string[] = [];
    const traverse = (nodes: SubTask[]) => {
        for (const node of nodes) {
            flat.push(node.id);
            if (node.subtasks) traverse(node.subtasks);
        }
    };
    traverse(items);
    const idx = flat.indexOf(targetId);
    return idx > 0 ? flat[idx - 1] : null;
};
