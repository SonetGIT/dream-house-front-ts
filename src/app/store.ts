import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import { rootReducer } from './rootReducer';
import { sessionActionGuard } from '../features/auth/sessionActionGuard';
import enumConfig from '../features/reference/enumConfig.json';

export const store = configureStore({
    reducer: rootReducer,
    // Auth thunk arguments include passwords; keep them out of Redux DevTools.
    devTools: false,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            thunk: {
                extraArgument: { config: enumConfig },
            },
            serializableCheck: false,
        }).concat(sessionActionGuard),
});

export type RootAppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootAppState>();
