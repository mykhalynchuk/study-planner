import { apiClient } from './httpClient';
import type { AuthUser, LoginCredentials, LoginResponse } from '../types/auth';

export const authApi = {
    login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
        const response = await apiClient.post<LoginResponse>('/auth/login', {
            username: credentials.username,
            password: credentials.password,
            expiresInMins: 60,
        });
        return response.data;
    },

    getMe: async (signal?: AbortSignal): Promise<AuthUser> => {
        const response = await apiClient.get<AuthUser>('/auth/me', { signal });
        return response.data;
    },
};