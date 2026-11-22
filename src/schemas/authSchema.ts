import { z } from 'zod';

export const loginSchema = z.object({
    username: z
        .string()
        .trim()
        .min(1, "Ім'я користувача обов'язкове"),
    password: z
        .string()
        .min(1, "Пароль обов'язковий")
        .min(6, 'Пароль має містити щонайменше 6 символів'),
});

export type LoginFormData = z.infer<typeof loginSchema>;