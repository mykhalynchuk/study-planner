import React, { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import axios from 'axios';
import { authApi } from '../api/authApi';
import { tokenStorage } from '../utils/tokenStorage';
import type { AuthUser, LoginCredentials } from '../types/auth';

export interface AuthContextValue {
    user: AuthUser | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    isAuthLoading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [accessToken, setAccessToken] = useState<string | null>(() => tokenStorage.getToken());
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isAuthLoading, setIsAuthLoading] = useState<boolean>(() => Boolean(tokenStorage.getToken()));

    useEffect(() => {
        if (!accessToken) {
            setUser(null);
            setIsAuthLoading(false);
            return;
        }

        if (user) {
            setIsAuthLoading(false);
            return;
        }

        const abortController = new AbortController();

        const restoreSession = async () => {
            setIsAuthLoading(true);
            try {
                const currentUser = await authApi.getMe(abortController.signal);
                setUser(currentUser);
            } catch (err) {
                if (axios.isCancel(err)) return;

                tokenStorage.clearToken();
                setAccessToken(null);
                setUser(null);
            } finally {
                if (!abortController.signal.aborted) {
                    setIsAuthLoading(false);
                }
            }
        };

        restoreSession();

        return () => abortController.abort();
    }, [accessToken, user]);

    const login = useCallback(async (credentials: LoginCredentials) => {
        const data = await authApi.login(credentials);

        tokenStorage.setToken(data.accessToken);
        setAccessToken(data.accessToken);
        setUser({
            id: data.id,
            username: data.username,
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            image: data.image,
        });
    }, []);

    const logout = useCallback(() => {
        tokenStorage.clearToken();
        setAccessToken(null);
        setUser(null);
    }, []);

    const isAuthenticated = Boolean(accessToken);

    const value = useMemo<AuthContextValue>(
        () => ({
            user,
            accessToken,
            isAuthenticated,
            isAuthLoading,
            login,
            logout,
        }),
        [user, accessToken, isAuthenticated, isAuthLoading, login, logout]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};