import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export interface Service {
    id: number;
    image: string;
    name: string;
    description: string;
    contents: { id: number, name: string }[];
    createdAt: string;
}

interface ServicesState {
    services: Service[];
    loading: boolean;
    error: string | null;
}

const initialState: ServicesState = {
    services: [],
    loading: false,
    error: null,
};

export const getServices = createAsyncThunk<Service[], void, { rejectValue: string }>(
    'services/getAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get('/api/services');
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch services');
        }
    }
);

export const createService = createAsyncThunk<Service, any, { rejectValue: string }>(
    'services/create',
    async (data, { rejectWithValue }) => {
        try {
            const response = await axios.post('/api/services', data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create service');
        }
    }
);

export const updateService = createAsyncThunk<Service, { id: number, data: any }, { rejectValue: string }>(
    'services/update',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await axios.put(`/api/services/${id}`, data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update service');
        }
    }
);

export const deleteService = createAsyncThunk<number, number, { rejectValue: string }>(
    'services/delete',
    async (id, { rejectWithValue }) => {
        try {
            await axios.delete(`/api/services/${id}`);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete service');
        }
    }
);

const ServicesSlice = createSlice({
    name: 'services',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getServices.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getServices.fulfilled, (state, action) => {
                state.loading = false;
                state.services = action.payload;
            })
            .addCase(getServices.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(createService.fulfilled, (state, action) => {
                state.services.unshift(action.payload);
            })
            .addCase(updateService.fulfilled, (state, action) => {
                state.services = state.services.map(s => s.id === action.payload.id ? action.payload : s);
            })
            .addCase(deleteService.fulfilled, (state, action) => {
                state.services = state.services.filter(s => s.id !== action.payload);
            });
    },
});

export const servicesReducer = ServicesSlice.reducer;
