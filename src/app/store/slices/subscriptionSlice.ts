import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { subscriptionState } from '@/utils/types';


const initialState: subscriptionState = {
    subscriptionInfo: [],
    loading: false,
    error: null,
};

export const getSubscription = createAsyncThunk<any,void,{ rejectValue: string }>(
    'Subscription',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get<any>('/api/subscription');
            return response.data.other;
        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                return rejectWithValue(
                    error.response?.data?.message || 'Failed to fetch user'
                );
            }
            return rejectWithValue('Unexpected error occurred');
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
    },
});
export const subscriptionReducer = SubscriptionSlice.reducer;
