import { apiRequest } from '@/utils/apiRequest';
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';

//TYPES
export interface Notification {
    id: number;
    title: string;
    message?: string;
    is_read: boolean;
    created_at: string;
    entity_type?: string | null;
    entity_id?: number | null;
    route_params?: {
        project_id?: number | string | null;
        prjBlockId?: number | string | null;
        prj_block_id?: number | string | null;
        block_id?: number | string | null;
    } | null;
}

type UnreadData = {
    unread_count: number;
};

interface State {
    items: Notification[];
    unreadCount: number;
    loading: boolean;
    error: string | null;
    listRequestId: string | null;
    countRequestId: string | null;
    liveItems: Notification[];
}

//INITIAL
const initialState: State = {
    items: [],
    unreadCount: 0,
    loading: false,
    error: null,
    listRequestId: null,
    countRequestId: null,
    liveItems: [],
};

const getErrorMessage = (error: unknown, fallback: string) =>
    error instanceof Error ? error.message : fallback;

//THUNKS
//теперь всё чисто — используем res.data
export const fetchUnreadCount = createAsyncThunk<number, void, { rejectValue: string }>(
    'notifications/unreadCount',
    async (_, { rejectWithValue }) => {
        try {
            const res = await apiRequest<UnreadData>('/notifications/unreadCount', 'GET');

            return res.data.unread_count ?? 0;
        } catch (error: unknown) {
            return rejectWithValue(getErrorMessage(error, 'Ошибка загрузки'));
        }
    },
);

// список уведомлений
export const fetchNotifications = createAsyncThunk<
    Notification[],
    { page: number; size: number },
    { rejectValue: string }
>('notifications/list', async (params, { rejectWithValue }) => {
    try {
        const res = await apiRequest<Notification[]>('/notifications/search', 'POST', params);

        return res.data ?? [];
    } catch (error: unknown) {
        return rejectWithValue(getErrorMessage(error, 'Ошибка загрузки'));
    }
});

// отметить как прочитанное
export const markAsRead = createAsyncThunk<number, number, { rejectValue: string }>(
    'notifications/read',
    async (id, { rejectWithValue }) => {
        try {
            await apiRequest(`/notifications/update/${id}`, 'PUT');
            return id;
        } catch (error: unknown) {
            return rejectWithValue(getErrorMessage(error, 'Ошибка обновления'));
        }
    },
);

//SLICE
const notificationSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        //realtime добавление
        addNotification: (state, action: PayloadAction<Notification>) => {
            const n = action.payload;

            if (!state.items.find((i) => i.id === n.id)) {
                state.items.unshift(n);
                if (!n.is_read) state.unreadCount++;
                if (state.listRequestId) state.liveItems.unshift(n);
            }
        },

        // ручная синхронизация
        setUnreadCount: (state, action: PayloadAction<number>) => {
            state.unreadCount = action.payload ?? 0;
        },
    },

    extraReducers: (builder) => {
        builder

            //UNREAD COUNT
            .addCase(fetchUnreadCount.pending, (state, action) => {
                state.countRequestId = action.meta.requestId;
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUnreadCount.fulfilled, (state, action) => {
                if (state.countRequestId !== action.meta.requestId) return;
                state.countRequestId = null;
                state.loading = state.listRequestId !== null;
                state.unreadCount = action.payload ?? 0;
            })
            .addCase(fetchUnreadCount.rejected, (state, action) => {
                if (state.countRequestId !== action.meta.requestId) return;
                state.countRequestId = null;
                state.loading = state.listRequestId !== null;
                state.error = action.payload || 'Ошибка загрузки';
            })

            //LIST
            .addCase(fetchNotifications.pending, (state, action) => {
                state.listRequestId = action.meta.requestId;
                state.liveItems = [];
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                if (state.listRequestId !== action.meta.requestId) return;
                state.listRequestId = null;
                state.loading = state.countRequestId !== null;
                const liveIds = new Set(state.liveItems.map((item) => item.id));
                state.items = [
                    ...state.liveItems,
                    ...action.payload.filter((item) => !liveIds.has(item.id)),
                ];
                state.liveItems = [];
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                if (state.listRequestId !== action.meta.requestId) return;
                state.listRequestId = null;
                state.liveItems = [];
                state.loading = state.countRequestId !== null;
                state.error = action.payload || 'Ошибка загрузки';
            })

            //MARK AS READ
            .addCase(markAsRead.fulfilled, (state, action) => {
                const id = action.payload;

                const item = state.items.find((i) => i.id === id);
                if (item && !item.is_read) {
                    item.is_read = true;
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
            })
            // Reset at the auth boundary, not on transport reconnect. In-flight
            // responses from the previous session are ignored by request IDs.
            .addMatcher(
                (action) => ['auth/logout', 'auth/fetchProfile/rejected', 'auth/authUser/fulfilled']
                    .includes(action.type),
                () => ({ ...initialState, items: [], liveItems: [] }),
            );
    },
});

export const { addNotification, setUnreadCount } = notificationSlice.actions;

export default notificationSlice.reducer;
