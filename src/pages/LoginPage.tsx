import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useSearchParams } from 'react-router';
import axios from 'axios';
import { loginSchema, type LoginFormData } from '../schemas/authSchema';
import { useAuth } from '../hooks/useAuth';
import './LoginPage.scss';

export const LoginPage: React.FC = () => {
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [serverError, setServerError] = useState<string | null>(null);

    const rawRedirect = searchParams.get('redirectTo');
    const redirectTo =
        rawRedirect && rawRedirect.startsWith('/') && !rawRedirect.startsWith('//')
            ? rawRedirect
            : '/tasks';

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            username: '',
            password: '',
        },
    });

    useEffect(() => {
        if (isAuthenticated) {
            navigate(redirectTo, { replace: true });
        }
    }, [isAuthenticated, navigate, redirectTo]);

    const onSubmit = async (data: LoginFormData) => {
        setServerError(null);
        try {
            await login(data);
            navigate(redirectTo, { replace: true });
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.data?.message) {
                setServerError(String(err.response.data.message));
            } else {
                setServerError('Не вдалося увійти. Перевірте логін, пароль або зʼєднання.');
            }
        }
    };

    return (
        <section className="login-page">
            <div className="login-page__card">
                <h1 className="login-page__title">Вхід у Study Planner</h1>
                <p className="login-page__subtitle">
                    Увійдіть, щоб створювати, редагувати та видаляти завдання
                </p>

                {serverError && (
                    <div className="login-page__alert" role="alert">
                        {serverError}
                    </div>
                )}

                <form className="login-page__form" onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className="login-page__field">
                        <label className="login-page__label" htmlFor="login-username">
                            Username
                        </label>
                        <input
                            id="login-username"
                            type="text"
                            autoComplete="username"
                            placeholder="emilys"
                            className={`login-page__input ${
                                errors.username ? 'login-page__input--error' : ''
                            }`}
                            {...register('username')}
                        />
                        {errors.username && (
                            <span className="login-page__error" role="alert">
                                {errors.username.message}
                            </span>
                        )}
                    </div>

                    <div className="login-page__field">
                        <label className="login-page__label" htmlFor="login-password">
                            Password
                        </label>
                        <input
                            id="login-password"
                            type="password"
                            autoComplete="current-password"
                            placeholder="••••••"
                            className={`login-page__input ${
                                errors.password ? 'login-page__input--error' : ''
                            }`}
                            {...register('password')}
                        />
                        {errors.password && (
                            <span className="login-page__error" role="alert">
                                {errors.password.message}
                            </span>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="login-page__submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Виконується вхід...' : 'Увійти'}
                    </button>
                </form>

                <div className="login-page__hint">
                    Тестовий акаунт DummyJSON: <code>emilys</code> / <code>emilyspass</code>
                </div>
            </div>
        </section>
    );
};