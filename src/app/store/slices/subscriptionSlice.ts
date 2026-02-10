import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { subscriptionState } from '@/utils/types';


const initialState: subscriptionState = {
    subscriptionInfo: [],
    loading: false,
    error: null,
};

export const getSubscription = createAsyncThunk<any, void, { rejectValue: string }>(
    'Subscription',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get<any>('/api/subscription');
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
            return response.data.other;
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
                state.subscriptionInfo = state.subscriptionInfo.filter((item: any) => item.id !== action.payload);
            })
            .addCase(updateSubscription.fulfilled, (state, action) => {
                state.subscriptionInfo = state.subscriptionInfo.map((item: any) =>
                    item.id === action.payload.id ? action.payload : item
                );
            });
    },
});
export const subscriptionReducer = SubscriptionSlice.reducer;
