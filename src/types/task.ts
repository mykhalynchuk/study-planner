export type Priority = 'low' | 'medium' | 'high';
export type FilterType = 'all' | 'completed' | 'uncompleted';

export interface Task {
    id: number;
    title: string;
    description: string;
    completed: boolean;
    priority: Priority;
    category: string;
    pendingDelete?: boolean;
}

export type TaskAction =
    | { type: 'set_tasks'; payload: Task[] }
    | { type: 'add'; payload: Omit<Task, 'id' | 'completed' | 'pendingDelete'> }
    | { type: 'toggle'; payload: number }
    | { type: 'update'; payload: Task }
    | { type: 'requestDelete'; payload: number }
    | { type: 'confirmDelete'; payload: number }
    | { type: 'undoDelete'; payload: number }
    | { type: 'clearCompleted' }
    | { type: 'reset' };