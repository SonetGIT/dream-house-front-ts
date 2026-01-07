import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import userReducer from '../features/users/userSlice';
import projectsReducer from '../features/projects/projectsSlice';
import referenceReducer from '../features/reference/referenceSlice';
import materialRequestsReducer from '@/features/projects/material_request/materialRequestsSlice';
import materialRequestItemsReducer from '@/features/projects/material_request_items/materialRequestItemsSlice';

export const rootReducer = combineReducers({
    auth: authReducer,
    users: userReducer,
    reference: referenceReducer,
    projects: projectsReducer,
    materialRequests: materialRequestsReducer,
    materialRequestItems: materialRequestItemsReducer,
});

export type RootReducerState = ReturnType<typeof rootReducer>;
