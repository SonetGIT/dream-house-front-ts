import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import NotFoundPage from '../pages/NotFoundPage';
import AuthPage from '../pages/AuthPage';
import ProjectsPage from '@/features/projects/ProjectsPage';
import UsersPage from '@/features/users/UsersPage';
import ProjectDashboardPage from '@/features/projects/ProjectDashboardPage';
import MaterialRequests from '@/features/projects/material_request/MaterialRequests';
import MaterialRequestItems from '@/features/projects/material_request_items/MaterialRequestItems';

export const router = createBrowserRouter([
    { path: '/login', element: <AuthPage /> },
    {
        path: '/',
        element: <App />,
        children: [
            { index: true, element: <ProjectsPage /> },
            { path: 'users', element: <UsersPage /> },
            { path: 'projects', element: <ProjectsPage /> },
            {
                path: 'projects/:id',
                element: <ProjectDashboardPage />,
                children: [
                    { index: true, element: null }, //дашборд
                    { path: 'materialRequests', element: <MaterialRequests /> },
                    { path: 'materialRequestItems', element: <MaterialRequestItems /> },
                ],
            },
        ],
    },
    { path: '*', element: <NotFoundPage /> },
]);
