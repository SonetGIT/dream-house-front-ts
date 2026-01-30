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
import documentStagesReducer from '@/features/projects/legal_department/documentStagesSlice';
import documentsReducer from '@/features/projects/legal_department/documentsSlice';
import documentFilesReducer from '@/features/projects/legal_department/documentFilesSlice';

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
});

export type RootReducerState = ReturnType<typeof rootReducer>;
