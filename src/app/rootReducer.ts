import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import userReducer from '../features/users/userSlice';
import projectsReducer from '../features/projects/a_project/projectsSlice';
import referenceReducer from '../features/reference/referenceSlice';
import materialRequestsReducer from '@/features/projects/material_request/materialRequestsSlice';
import materialRequestItemsReducer from '@/features/projects/material_request_items/materialRequestItemsSlice';
import purchaseOrdersReducer from '@/features/projects/purchaseOrders/purchaseOrdersSlice';
import warehousesReducer from '@/features/projects/warehouses/warehousesSlice';
import warehouseStocksReducer from '@/features/projects/warehouseStocks/warehouseStocksSlice';
import purchaseOrderItemsReducer from '@/features/projects/purchaseOrderItems/purchaseOrderItemsSlice';
import materialMovementsReducer from '@/features/projects/materialMovements/materialMovementsSlice';
import suppliersReducer from '@/features/suppliers/suppliersSlice';
import supplierRatingReducer from '@/features/suppliers/supplierRating/supplierRatingSlice';
import contractorsReducer from '@/features/contractors/contractorsSlice';
import documentFilesReducer from '@/features/projects/legal_department/files/documentFilesSlice';
import auditLogReducer from '@/features/auditLog/auditLogSlice';
import materialsReducer from '@/features/materials/materialsSlice';
import projectBlocksReducer from '@/features/projects/pto/projectBlocks/projectBlocksSlice';
import blockStagesReducer from '@/features/projects/pto/projectBlocks/blockStages/blockStagesSlice';
import stageSubsectionsReducer from '@/features/projects/pto/projectBlocks/blockStages/subStages/stageSubsectionsSlice';
import estimatesReducer from '@/features/projects/pto/projectBlocks/estimatess/estimatesSlice';
import estimateItemsReducer from '@/features/projects/pto/projectBlocks/estimatess/estimateItems/estimateItemsSlice';
import legalDocStageReducer from '@/features/projects/legal_department/legalDocStages/legalDocStageSlice';
import legalDocumentReducer from '@/features/projects/legal_department/legalDoc/legalDocSlice';
import notificationsReducer from '@/features/notification/notificationSlice';
import tasksReducer from '@/features/projects/tasks/tasksSlice';

export const rootReducer = combineReducers({
    auth: authReducer,
    users: userReducer,
    reference: referenceReducer,
    projects: projectsReducer,
    materialRequests: materialRequestsReducer,
    materialRequestItems: materialRequestItemsReducer,
    purchaseOrders: purchaseOrdersReducer,
    warehouses: warehousesReducer,
    warehouseStocks: warehouseStocksReducer,
    purchaseOrderItems: purchaseOrderItemsReducer,
    materialMovements: materialMovementsReducer,
    suppliers: suppliersReducer,
    supplierRatings: supplierRatingReducer,
    contractors: contractorsReducer,
    legalDocStages: legalDocStageReducer,
    legalDocuments: legalDocumentReducer,
    documentFiles: documentFilesReducer,
    auditLog: auditLogReducer,
    materials: materialsReducer,
    projectBlocks: projectBlocksReducer,
    blockStages: blockStagesReducer,
    stageSubsections: stageSubsectionsReducer,
    estimates: estimatesReducer,
    estimateItems: estimateItemsReducer,
    notifications: notificationsReducer,
    tasks: tasksReducer,
});

export type RootReducerState = ReturnType<typeof rootReducer>;
