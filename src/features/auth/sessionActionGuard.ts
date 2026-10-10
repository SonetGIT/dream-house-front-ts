import type { Middleware } from '@reduxjs/toolkit';

// Requests belonging to a previous login must not repopulate cleared account data.
export const sessionActionGuard: Middleware = (store) => {
    const pending = new Map<string, string | null>();
    return (next) => (action) => {
        if (!action || typeof action !== 'object' || !('type' in action) ||
            typeof action.type !== 'string' || action.type.startsWith('auth/')) return next(action);
        const meta = 'meta' in action ? action.meta as { requestId?: string; requestStatus?: string } : undefined;
        if (meta?.requestId) {
            const generation = store.getState().auth.generation;
            if (meta.requestStatus === 'pending') pending.set(meta.requestId, generation);
            else if (pending.has(meta.requestId)) {
                const previous = pending.get(meta.requestId);
                pending.delete(meta.requestId);
                if (previous !== generation) return action;
            }
        }
        return next(action);
    };
};
