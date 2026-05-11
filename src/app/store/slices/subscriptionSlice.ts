import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { subscriptionState } from '@/utils/types';


const initialState: subscriptionState = {
    subscriptionInfo: {
        data: [],
        pagination: {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0
        }
    },
    loading: false,
    error: null,
};

export const getSubscription = createAsyncThunk<any, { page?: number, limit?: number, search?: string, status?: string } | void, { rejectValue: string }>(
    'Subscription',
    async (params, { rejectWithValue }) => {
        try {
            const queryParams = new URLSearchParams();
            if (params) {
                if (params.page) queryParams.append('page', params.page.toString());
                if (params.limit) queryParams.append('limit', params.limit.toString());
                if (params.search) queryParams.append('search', params.search);
                if (params.status && params.status !== 'ALL') queryParams.append('status', params.status);
            }
            const response = await axios.get<any>(`/api/subscription?${queryParams.toString()}`);
            return response.data;
        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                return rejectWithValue(
                    error.response?.data?.message || 'Failed to fetch subscriptions'
                );
            }
            return rejectWithValue('Unexpected error occurred');
        }
    }
);

export const deleteSubscription = createAsyncThunk<number, number, { rejectValue: string }>(
    'subscription/delete',
    async (id, { rejectWithValue }) => {
        try {
            await axios.delete(`/api/subscription/${id}`);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete subscription');
        }
    }
);

export const updateSubscription = createAsyncThunk<any, { id: number, data: any }, { rejectValue: string }>(
    'subscription/update',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await axios.put(`/api/subscription/${id}`, data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update subscription');
        }
    }
);

const SubscriptionSlice = createSlice({
    name: 'subscription',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // loginUser --- IGNORE ---
            .addCase(getSubscription.pending, (state) => { // أثناء التحميل البيانات
                state.loading = true;
                state.error = null;
            })
            .addCase(getSubscription.fulfilled, (state, action) => { // عند نجاح جلب البيانات
                state.loading = false;
                state.subscriptionInfo = action.payload;
            })
            .addCase(getSubscription.rejected, (state, action) => { // عند فشل جلب البيانات
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(deleteSubscription.fulfilled, (state, action) => {
                const deletedId = action.payload;
                state.subscriptionInfo.data = state.subscriptionInfo.data.filter((item: any) => item.id != deletedId);
                state.subscriptionInfo.pagination.total -= 1;
            })
            .addCase(updateSubscription.fulfilled, (state, action) => {
                const updatedSub = action.payload.subscription || action.payload;
                if (updatedSub && updatedSub.id) {
                    state.subscriptionInfo.data = state.subscriptionInfo.data.map((item: any) =>
                        item.id == updatedSub.id ? { ...item, ...updatedSub } : item
                    );
                }
            });
    },
});
export const subscriptionReducer = SubscriptionSlice.reducer;
