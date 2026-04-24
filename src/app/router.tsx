import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import NotFoundPage from '../pages/NotFoundPage';
import AuthPage from '../pages/AuthPage';
import MaterialsPage from '@/features/materials/MaterialsPage';
import PtoPage from '@/features/projects/pto/PtoPage';
import LegalDocStagesPage from '@/features/projects/legal_department/legalDocStages/LegalDocStagesPage';
import ProjectsPage from '@/features/projects/a_project/ProjectsPage';
import ProjectDashboardPage from '@/features/projects/a_project/ProjectDashboardPage';
import ContractorsPage from '@/features/contractors/ContractorsPage';
import SuppliersPage from '@/features/suppliers/SuppliersPage';
import UsersPage from '@/features/users/UsersPage';
import MaterialRequestsPage from '@/features/projects/material_request/MaterialRequestsPage';
import Dashboard from '@/components/ui/dashboard/Dashboard';
import EstimatesStagePage from '@/features/projects/pto/projectBlocks/EstimatesStagePage';
import ProjectBlocksTabs from '@/features/projects/pto/projectBlocks/ProjectBlocksTabs';
import PurchaseOrdersPage from '@/features/projects/purchaseOrders/PurchaseOrdersPage';
import TasksPage from '@/features/projects/tasks/TasksPage';
import WorkPerformedPage from '@/features/projects/pto/workPerformed/WorkPerformedPage';
import WarehousesPage from '@/features/projects/warehouses/WarehousesPage';
import ReportsPage from '@/features/projects/reports/ReportsPage';

export const router = createBrowserRouter([
    { path: '/login', element: <AuthPage /> },

    {
        path: '/',
        element: <App />,
        children: [
            { path: 'users', element: <UsersPage /> },
            { path: 'suppliers', element: <SuppliersPage /> },
            { path: 'contractors', element: <ContractorsPage /> },
            { path: 'materials', element: <MaterialsPage /> },

            {
                path: 'projects',
                children: [
                    { index: true, element: <ProjectsPage /> },
                    {
                        path: ':projectId',
                        element: <ProjectDashboardPage />,
                        children: [
                            { index: true, element: <Dashboard /> },
                            { path: 'documentStages', element: <LegalDocStagesPage /> },
                            { path: 'pto', element: <PtoPage /> },
                            {
                                path: 'prjBlocks/:prjBlockId',
                                element: <ProjectBlocksTabs />,
                                children: [
                                    { index: true, element: <EstimatesStagePage /> }, // default
                                    { path: 'materialRequests', element: <MaterialRequestsPage /> },
                                    { path: 'purchaseOrders', element: <PurchaseOrdersPage /> },
                                    { path: 'workPerformed', element: <WorkPerformedPage /> },
                                ],
                            },
                            { path: 'tasks', element: <TasksPage /> },
                            { path: 'warehouses', element: <WarehousesPage /> },
                            { path: 'reports', element: <ReportsPage /> },
                        ],
                    },
                ],
            },
        ],
    },
    { path: '*', element: <NotFoundPage /> },
]);
