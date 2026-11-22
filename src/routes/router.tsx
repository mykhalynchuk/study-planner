import { createBrowserRouter, redirect, type LoaderFunctionArgs } from 'react-router';
import { AppLayout } from '../layouts/AppLayout';
import { TasksPage } from '../pages/TasksPage';
import { TaskDetailsPage } from '../pages/TaskDetailsPage';
import { LoginPage } from '../pages/LoginPage';
import { ProfilePage } from '../pages/ProfilePage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { tokenStorage } from '../utils/tokenStorage';

function protectedLoader({ request }: LoaderFunctionArgs) {
    const token = tokenStorage.getToken();

    if (!token) {
        const url = new URL(request.url);
        const redirectTo = encodeURIComponent(url.pathname + url.search);
        return redirect(`/login?redirectTo=${redirectTo}`);
    }

    return null;
}

export const router = createBrowserRouter([
    {
        path: '/',
        Component: AppLayout,
        children: [
            {
                index: true,
                loader: () => redirect('/tasks'),
            },
            {
                path: 'tasks',
                Component: TasksPage,
            },
            {
                path: 'tasks/:taskId',
                Component: TaskDetailsPage,
            },
            {
                path: 'login',
                Component: LoginPage,
            },
            {
                path: 'profile',
                loader: protectedLoader,
                Component: ProfilePage,
            },
            {
                path: '*',
                Component: NotFoundPage,
            },
        ],
    },
]);