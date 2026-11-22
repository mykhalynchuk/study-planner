import React from 'react';
import './Toast.scss';
import { useTaskContext } from '../hooks/useTaskContext';

export const Toast: React.FC = () => {
    const { toast } = useTaskContext();

    if (!toast.visible) return null;

    return (
        <div className={`toast toast--${toast.type}`} role="status" aria-live="polite">
            <span className="toast__message">{toast.message}</span>
        </div>
    );
};