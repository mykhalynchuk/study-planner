import React from 'react';
import { useTaskContext } from '../hooks/useTaskContext';

export const Toast: React.FC = () => {
    const { toast, undoDelete } = useTaskContext();

    if (!toast.visible) return null;

    return (
        <div className={`toast toast--${toast.type}`}>
            <span className="toast__message">{toast.message}</span>

            {toast.undoId !== undefined && (
                <>
                    <button
                        className="toast__btn"
                        onClick={() => undoDelete(toast.undoId!)}
                    >
                        ВІДМІНИТИ
                    </button>
                    <div className="toast__progress">
                        <div className="toast__progress-fill"></div>
                    </div>
                </>
            )}
        </div>
    );
};