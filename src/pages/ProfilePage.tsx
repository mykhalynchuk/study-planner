import React from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import './ProfilePage.scss';

export const ProfilePage: React.FC = () => {
    const { user, isAuthenticated, isAuthLoading, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    if (isAuthLoading) {
        return (
            <section className="profile-page">
                <div className="profile-page__card">Завантаження профілю...</div>
            </section>
        );
    }

    return (
        <section className="profile-page">
            <div className="profile-page__card">
                <div className="profile-page__header">
                    {user?.image && (
                        <img
                            src={user.image}
                            alt={user.username}
                            className="profile-page__avatar"
                        />
                    )}
                    <div>
                        <h1 className="profile-page__title">
                            {user
                                ? `${user.firstName} ${user.lastName}`.trim() || user.username
                                : 'Користувач'}
                        </h1>
                        <span className="profile-page__badge">
                            {isAuthenticated ? 'Авторизовано' : 'Гість'}
                        </span>
                    </div>
                </div>

                <dl className="profile-page__info">
                    <div className="profile-page__row">
                        <dt className="profile-page__label">Username</dt>
                        <dd className="profile-page__value">{user?.username ?? '—'}</dd>
                    </div>
                    <div className="profile-page__row">
                        <dt className="profile-page__label">Email</dt>
                        <dd className="profile-page__value">{user?.email ?? '—'}</dd>
                    </div>
                    <div className="profile-page__row">
                        <dt className="profile-page__label">Статус сесії</dt>
                        <dd className="profile-page__value">
                            {isAuthenticated ? 'Активна (Bearer token)' : 'Неактивна'}
                        </dd>
                    </div>
                </dl>

                <button
                    type="button"
                    className="profile-page__logout-btn"
                    onClick={handleLogout}
                >
                    Вийти з акаунта (Logout)
                </button>
            </div>
        </section>
    );
};