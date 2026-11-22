import { z } from 'zod';

export const taskSchema = z.object({
    title: z
        .string()
        .trim()
        .min(1, "Назва завдання обов'язкова")
        .max(120, 'Назва не може перевищувати 120 символів'),
    description: z
        .string()
        .trim()
        .max(500, 'Опис не може перевищувати 500 символів'),
    category: z
        .string()
        .trim()
        .min(1, "Категорія обов'язкова")
        .max(40, 'Категорія занадто довга'),
    priority: z.enum(['low', 'medium', 'high']),
});

export type TaskFormData = z.infer<typeof taskSchema>;