import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import NotFoundPage from '../pages/NotFoundPage';
import AuthPage from '../pages/AuthPage';
import ProjectsPage from '@/features/projects/ProjectsPage';
import UsersPage from '@/features/users/UsersPage';
import ProjectDashboardPage from '@/features/projects/ProjectDashboardPage';
import MaterialRequests from '@/features/projects/material_request/MaterialRequests';
import PurchaseRequestTabs from '@/features/projects/purchaseOrders/PurchaseRequestTabs';
import WarehousesPage from '@/features/projects/warehouses/WarehousesPage';
import WarehouseTabs from '@/features/projects/warehouses/WarehouseTabs';
import SuppliersPage from '@/features/suppliers/SuppliersPage';

export const router = createBrowserRouter([
    { path: '/login', element: <AuthPage /> },
    {
        path: '/',
        element: <App />,
        children: [
            { index: true, element: <ProjectsPage /> },
            { path: 'users', element: <UsersPage /> },
            { path: 'projects', element: <ProjectsPage /> },
            { path: 'suppliers', element: <SuppliersPage /> },
            {
                path: 'projects/:projectId',
                element: <ProjectDashboardPage />,
                children: [
                    { index: true, element: null }, //дашборд
                    { path: 'materialRequests', element: <MaterialRequests /> },
                    { path: 'purchaseRequestCard', element: <PurchaseRequestTabs /> },
                    { path: 'warehouses', element: <WarehousesPage /> },
                    { path: 'warehouses/:warehouseId', element: <WarehouseTabs /> },
                ],
            },
        ],
    },
    { path: '*', element: <NotFoundPage /> },
]);
