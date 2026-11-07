import React from 'react';
import { useTaskContext } from '../hooks/useTaskContext';

export const Toast: React.FC = () => {
    const { toast } = useTaskContext();
    if (!toast.visible) return null;
    return <div className={`toast toast--${toast.type}`}>{toast.message}</div>;
};