import React from 'react';
import { Link } from 'react-router';
import './NotFoundPage.scss';

export const NotFoundPage: React.FC = () => {
    return (
        <section className="not-found">
            <div className="not-found__card">
                <span className="not-found__code">404</span>
                <h1 className="not-found__title">Сторінку не знайдено</h1>
                <p className="not-found__text">
                    Схоже, за цією адресою немає жодної сторінки Study Planner.
                </p>
                <Link to="/tasks" className="not-found__link">
                    Повернутися до завдань
                </Link>
            </div>
        </section>
    );
};