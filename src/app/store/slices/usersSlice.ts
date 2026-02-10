import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { UserDashbord as User } from '@/utils/types';

interface UsersState {
    users: User[];
    loading: boolean;
    error: string | null;
}

const initialState: UsersState = {
    users: [],
    loading: false,
    error: null,
};

export const getAllUsers = createAsyncThunk<User[], void, { rejectValue: string }>(
    'users/getAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get('/api/users');
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
                state.users = action.payload;
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
            });
    },
});

export const usersReducer = UsersSlice.reducer;
