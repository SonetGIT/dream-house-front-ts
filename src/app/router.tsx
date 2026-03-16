import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import NotFoundPage from '../pages/NotFoundPage';
import AuthPage from '../pages/AuthPage';
import UsersPage from '@/features/users/UsersPage';

import MaterialRequests from '@/features/projects/material_request/MaterialRequests';
import PurchaseRequestTabs from '@/features/projects/purchaseOrders/PurchaseRequestTabs';
import WarehousesPage from '@/features/projects/warehouses/WarehousesPage';
import WarehouseTabs from '@/features/projects/warehouses/WarehouseTabs';
// import DocumentsPage from '@/features/projects/legal_department/documents/DocumentsPage';
import MaterialsPage from '@/features/materials/MaterialsPage';
import BlocksManager from '@/features/projects/pto/PtoManager';
import LegalDocStagesPage from '@/features/projects/legal_department/legalDocStages/LegalDocStagesPage';
import ProjectsPage from '@/features/projects/a_project/ProjectsPage';
import ProjectDashboardPage from '@/features/projects/a_project/ProjectDashboardPage';
import ContractorsPage from '@/features/contractors/ContractorsPage';
import SuppliersPage from '@/features/suppliers/SuppliersPage';

export const router = createBrowserRouter([
    { path: '/login', element: <AuthPage /> },
    {
        path: '/',
        element: <App />,
        children: [
            { path: 'users', element: <UsersPage /> },
            { path: 'projects', element: <ProjectsPage /> },
            { path: 'suppliers', element: <SuppliersPage /> },
            { path: 'contractors', element: <ContractorsPage /> },
            { path: 'materials', element: <MaterialsPage /> },
            {
                path: 'projects/:projectId',
                element: <ProjectDashboardPage />,
                children: [
                    { index: true, element: null }, //дашборд
                    { path: 'documentStages', element: <LegalDocStagesPage /> },
                    // { path: 'documentStages/:documentStagesId', element: <DocumentsPage /> },
                    { path: 'pto', element: <BlocksManager /> },
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
