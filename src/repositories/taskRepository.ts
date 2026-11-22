import { apiClient } from '../api/httpClient';
import type { ApiTodo, TodosResponse } from '../types/api';
import type { Task } from '../types/task';

export type CreateTaskPayload = Omit<Task, 'id' | 'completed' | 'createdAt'>;
export type UpdateTaskPayload = Partial<Omit<Task, 'id'>>;

const mapToTask = (apiTodo: ApiTodo): Task => ({
    id: apiTodo.id,
    title: apiTodo.todo,
    completed: apiTodo.completed,
    description: 'Опис для цього завдання ще не додано (client-owned metadata).',
    priority: 'medium',
    category: 'General',
    createdBy: `User #${apiTodo.userId}`,
    createdAt: new Date().toISOString(),
});

export const taskRepository = {
    getAll: async (
        limit: number,
        skip: number,
        signal?: AbortSignal
    ): Promise<{ tasks: Task[]; total: number }> => {
        const response = await apiClient.get<TodosResponse>(
            `/todos?limit=${limit}&skip=${skip}`,
            { signal }
        );
        return {
            tasks: response.data.todos.map(mapToTask),
            total: response.data.total,
        };
    },

    getById: async (id: number, signal?: AbortSignal): Promise<Task> => {
        const response = await apiClient.get<ApiTodo>(`/todos/${id}`, { signal });
        return mapToTask(response.data);
    },

    create: async (payload: CreateTaskPayload): Promise<Task> => {
        const response = await apiClient.post<ApiTodo>('/todos/add', {
            todo: payload.title,
            completed: false,
            userId: 1,
        });

        return {
            ...mapToTask(response.data),
            title: payload.title,
            description: payload.description,
            category: payload.category,
            priority: payload.priority,
            createdBy: payload.createdBy,
            createdAt: new Date().toISOString(),
        };
    },

    update: async (id: number, payload: UpdateTaskPayload): Promise<Task> => {
        const response = await apiClient.put<ApiTodo>(`/todos/${id}`, {
            todo: payload.title,
            completed: payload.completed,
        });

        return {
            ...mapToTask(response.data),
            ...payload,
            id: response.data.id,
        };
    },

    delete: async (id: number): Promise<boolean> => {
        const response = await apiClient.delete(`/todos/${id}`);
        return response.status === 200;
    },
};