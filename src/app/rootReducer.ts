import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import userReducer from '../features/users/userSlice';
import projectsReducer from '../features/projects/projectsSlice';
import referenceReducer from '../features/reference/referenceSlice';
import materialRequestsReducer from '@/features/projects/material_request/materialRequestsSlice';
import materialRequestItemsReducer from '@/features/projects/material_request_items/materialRequestItemsSlice';
import purchaseOrdersReducer from '@/features/projects/purchaseOrders/purchaseOrdersSlice';
import warehousesReducer from '@/features/warehouses/warehousesSlice';
import warehouseStocksReducer from '@/features/projects/warehouseStocks/warehouseStocksSlice';
import purchaseOrderItemsReducer from '@/features/purchaseOrderItems/purchaseOrderItemsSlice';

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
});

export type RootReducerState = ReturnType<typeof rootReducer>;
