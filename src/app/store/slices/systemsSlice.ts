import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export interface System {
    id: number;
    name: string;
    name_en: string;
    name_ar: string;
    description: string;
    description_en: string;
    description_ar: string;
    icon: string;
    price: number | string;
    renewalPrice?: number | string;
    createdAt: string;
}

interface SystemsState {
    systems: System[];
    loading: boolean;
    error: string | null;
}

const initialState: SystemsState = {
    systems: [],
    loading: false,
    error: null,
};

export const getSystems = createAsyncThunk<System[], void, { rejectValue: string }>(
    'systems/getAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get('/api/systems');
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch systems');
        }
    }
);

export const createSystem = createAsyncThunk<System, any, { rejectValue: string }>(
    'systems/create',
    async (data, { rejectWithValue }) => {
        try {
            const response = await axios.post('/api/systems', data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create system');
        }
    }
);

export const updateSystem = createAsyncThunk<System, { id: number, data: any }, { rejectValue: string }>(
    'systems/update',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await axios.put(`/api/systems/${id}`, data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update system');
        }
    }
);

export const deleteSystem = createAsyncThunk<number, number, { rejectValue: string }>(
    'systems/delete',
    async (id, { rejectWithValue }) => {
        try {
            await axios.delete(`/api/systems/${id}`);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete system');
        }
    }
);

const SystemsSlice = createSlice({
    name: 'systems',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getSystems.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getSystems.fulfilled, (state, action) => {
                state.loading = false;
                state.systems = action.payload;
            })
            .addCase(getSystems.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(createSystem.fulfilled, (state, action) => {
                state.systems.unshift(action.payload);
            })
            .addCase(updateSystem.fulfilled, (state, action) => {
                state.systems = state.systems.map(s => s.id === action.payload.id ? action.payload : s);
            })
            .addCase(deleteSystem.fulfilled, (state, action) => {
                state.systems = state.systems.filter(s => s.id !== action.payload);
            });
    },
});

export const systemsReducer = SystemsSlice.reducer;
