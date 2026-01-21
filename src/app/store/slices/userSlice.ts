import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { UserDashbord as User } from '@/utils/types';
import { UserState } from '@/utils/types';


const initialState: UserState = {
    userInfo: [],
    loading: false,
    error: null,
    isAuthenticated: false,
};

export const getUser = createAsyncThunk<any,void,{ rejectValue: string }>(
    'user/getUser',
    async (_, { rejectWithValue, signal }) => {
        try {
            const response = await axios.get<any>(
                '/api/users/profile',
                { signal }
            );
            return response.data;
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

export const logoutUser = createAsyncThunk(
    'user/logout',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get<User>(
                '/api/users/logout',
            );
            return true;
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

const UserSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // loginUser --- IGNORE ---
            .addCase(getUser.pending, (state) => { // أثناء التحميل البيانات
                state.loading = true;
                state.error = null;
            })
            .addCase(getUser.fulfilled, (state, action) => { // عند نجاح جلب البيانات
                state.loading = false;
                state.userInfo = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(getUser.rejected, (state, action) => { // عند فشل جلب البيانات
                state.loading = false;
                state.error = action.payload as string;
                state.isAuthenticated = false;
            })
            // logoutUser --- IGNORE ---
            .addCase(logoutUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(logoutUser.fulfilled, (state, action) => {
                state.loading = false;
                state.userInfo = action.payload;
                state.isAuthenticated = false;
            })
            .addCase(logoutUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.isAuthenticated = true;
            });
    },
});
export const userReducer = UserSlice.reducer;
