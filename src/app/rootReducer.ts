import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import userReducer from '../features/users/userSlice';
import projectsReducer from '../features/projects/projectsSlice';
import referenceReducer from '../features/reference/referenceSlice';
import materialRequestsReducer from '@/features/projects/material_request/materialRequestsSlice';
import materialRequestItemsReducer from '@/features/projects/material_request_items/materialRequestItemsSlice';
import purchaseOrdersReducer from '@/features/projects/purchaseOrders/purchaseOrdersSlice';
import warehousesReducer from '@/features/projects/warehouses/warehousesSlice';
import warehouseStocksReducer from '@/features/projects/warehouseStocks/warehouseStocksSlice';
import purchaseOrderItemsReducer from '@/features/projects/purchaseOrderItems/purchaseOrderItemsSlice';
import materialMovementsReducer from '@/features/projects/materialMovements/materialMovementsSlice';
import suppliersReducer from '@/features/suppliers/suppliersSlice';
import documentStagesReducer from '@/features/projects/legal_department/documentStages/documentStagesSlice';
import documentsReducer from '@/features/projects/legal_department/documents/documentsSlice';
import documentFilesReducer from '@/features/projects/legal_department/files/documentFilesSlice';
import auditLogReducer from '@/features/auditLog/auditLogSlice';
import materialsReducer from '@/features/materials/materialsSlice';
import projectBlocksReducer from '@/features/projects/pto/projectBlocks/projectBlocksSlice';
import blockStagesReducer from '@/features/projects/pto/projectBlocks/blockStages/blockStagesSlice';
import stageSubsectionsReducer from '@/features/projects/pto/projectBlocks/blockStages/stageSubsections/stageSubsectionsSlice';

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
    documentStages: documentStagesReducer,
    documents: documentsReducer,
    documentFiles: documentFilesReducer,
    auditLog: auditLogReducer,
    materials: materialsReducer,
    projectBlocks: projectBlocksReducer,
    blockStages: blockStagesReducer,
    stageSubsections: stageSubsectionsReducer,
});

export type RootReducerState = ReturnType<typeof rootReducer>;
