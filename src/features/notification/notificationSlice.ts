import { apiRequest } from '@/utils/apiRequest';
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';

//TYPES
export interface Notification {
    id: number;
    title: string;
    message?: string;
    is_read: boolean;
    created_at: string;
}

type UnreadData = {
    unread_count: number;
};

interface State {
    items: Notification[];
    unreadCount: number;
    loading: boolean;
    error: string | null;
}

//INITIAL
const initialState: State = {
    items: [],
    unreadCount: 0,
    loading: false,
    error: null,
};

//THUNKS
//теперь всё чисто — используем res.data
export const fetchUnreadCount = createAsyncThunk<number, void, { rejectValue: string }>(
    'notifications/unreadCount',
    async (_, { rejectWithValue }) => {
        try {
            const res = await apiRequest<UnreadData>('/notifications/unreadCount', 'GET');

            return res.data.unread_count ?? 0;
        } catch (e: any) {
            return rejectWithValue(e.message);
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
    } catch (e: any) {
        return rejectWithValue(e.message);
    }
});

// отметить как прочитанное
export const markAsRead = createAsyncThunk<number, number, { rejectValue: string }>(
    'notifications/read',
    async (id, { rejectWithValue }) => {
        try {
            await apiRequest(`/notifications/update/${id}`, 'PUT');
            return id;
        } catch (e: any) {
            return rejectWithValue(e.message);
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
                state.unreadCount++;
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
            .addCase(fetchUnreadCount.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUnreadCount.fulfilled, (state, action) => {
                state.loading = false;
                state.unreadCount = action.payload ?? 0;
            })
            .addCase(fetchUnreadCount.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Ошибка загрузки';
            })

            //LIST
            .addCase(fetchNotifications.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.loading = false;
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
            });
    },
});

export const { addNotification, setUnreadCount } = notificationSlice.actions;

export default notificationSlice.reducer;
