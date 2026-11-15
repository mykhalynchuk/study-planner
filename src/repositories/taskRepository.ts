import { apiClient } from '../api/httpClient';
import type { ApiTodo, TodosResponse } from '../types/api';
import type { Task } from '../types/task';

const mapToTask = (apiTodo: ApiTodo): Task => ({
    id: apiTodo.id,
    title: apiTodo.todo,
    description: '',
    completed: apiTodo.completed,
    priority: 'medium',
    category: 'Загальне',
});

export const taskRepository = {
    getAll: async (limit: number, skip: number, signal?: AbortSignal): Promise<{ tasks: Task[], total: number }> => {
        const response = await apiClient.get<TodosResponse>(`/todos?limit=${limit}&skip=${skip}`, { signal });
        return {
            tasks: response.data.todos.map(mapToTask),
            total: response.data.total
        };
    },


    getById: async (id: number, signal?: AbortSignal): Promise<Task> => {
        const response = await apiClient.get<ApiTodo>(`/todos/${id}`, { signal });
        return mapToTask(response.data);
    },

    create: async (task: Omit<Task, 'id' | 'pendingDelete'>): Promise<Task> => {
        const response = await apiClient.post<ApiTodo>('/todos/add', {
            todo: task.title,
            completed: task.completed,
            userId: 1,
        });

        return { ...task, ...mapToTask(response.data) };
    },

    update: async (id: number, task: Partial<Task>): Promise<Task> => {
        const response = await apiClient.put<ApiTodo>(`/todos/${id}`, {
            todo: task.title,
            completed: task.completed,
        });
        return { ...task, ...mapToTask(response.data) } as Task;
    },

    delete: async (id: number): Promise<boolean> => {
        const response = await apiClient.delete(`/todos/${id}`);
        return response.status === 200;
    }
};