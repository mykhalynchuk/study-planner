import React from 'react';
import { RouterProvider } from 'react-router/dom';
import { AuthProvider } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';
import { router } from './routes/router';

export const App: React.FC = () => {
    return (
        <AuthProvider>
            <TaskProvider>
                <RouterProvider router={router} />
            </TaskProvider>
        </AuthProvider>
    );
};

export default App;