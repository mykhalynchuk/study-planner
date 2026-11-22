import React from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { Toast } from '../components/Toast';
import './AppLayout.scss';

export const AppLayout: React.FC = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        if (location.pathname.startsWith('/profile')) {
            navigate('/login', { replace: true });
        }
    };

    const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
        `app-layout__link ${isActive ? 'app-layout__link--active' : ''}`;

    return (
        <div className="app-layout">
            <header className="app-layout__header">
                <div className="app-layout__header-inner">
                    <Link to="/tasks" className="app-layout__brand">
                        Study Planner
                    </Link>

                    <nav className="app-layout__nav" aria-label="Головна навігація">
                        <NavLink to="/tasks" className={getNavLinkClass}>
                            Tasks
                        </NavLink>
                        <NavLink to="/profile" className={getNavLinkClass}>
                            Profile
                        </NavLink>
                    </nav>

                    <div className="app-layout__auth">
                        {isAuthenticated ? (
                            <>
                                <span className="app-layout__user">
                                    {user?.username ?? 'Авторизовано'}
                                </span>
                                <button
                                    type="button"
                                    className="app-layout__btn app-layout__btn--logout"
                                    onClick={handleLogout}
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <NavLink
                                to="/login"
                                className="app-layout__btn app-layout__btn--login"
                            >
                                Login
                            </NavLink>
                        )}
                    </div>
                </div>
            </header>

            <main className="app-layout__main">
                <Outlet />
            </main>

            <Toast />
        </div>
    );
};