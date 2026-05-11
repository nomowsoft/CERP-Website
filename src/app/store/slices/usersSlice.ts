import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { UserDashbord as User } from '@/utils/types';

interface UsersState {
    users: User[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    loading: boolean;
    error: string | null;
}

const initialState: UsersState = {
    users: [],
    pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
    },
    loading: false,
    error: null,
};

export const getAllUsers = createAsyncThunk<any, { page?: number, limit?: number, search?: string } | void, { rejectValue: string }>(
    'users/getAll',
    async (params, { rejectWithValue }) => {
        try {
            const queryParams = new URLSearchParams();
            if (params) {
                if (params.page) queryParams.append('page', params.page.toString());
                if (params.limit) queryParams.append('limit', params.limit.toString());
                if (params.search) queryParams.append('search', params.search);
            }
            const response = await axios.get(`/api/users?${queryParams.toString()}`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
        }
    }
);

export const adminUpdateUser = createAsyncThunk<User, { id: number, data: any }, { rejectValue: string }>(
    'users/update',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await axios.put(`/api/users/profile/${id}`, data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update user');
        }
    }
);

export const adminDeleteUser = createAsyncThunk<number, number, { rejectValue: string }>(
    'users/delete',
    async (id, { rejectWithValue }) => {
        try {
            await axios.delete(`/api/users/profile/${id}`);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete user');
        }
    }
);

const UsersSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getAllUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(getAllUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(adminUpdateUser.fulfilled, (state, action) => {
                state.users = state.users.map(u => u.id === action.payload.id ? action.payload : u);
            })
            .addCase(adminDeleteUser.fulfilled, (state, action) => {
                state.users = state.users.filter(u => u.id !== action.payload);
                state.pagination.total -= 1;
            });
    },
});

export const usersReducer = UsersSlice.reducer;
