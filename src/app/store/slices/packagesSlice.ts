import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { PackageType } from '@/generated/prisma';

export interface Package {
    id: number;
    image: string;
    name: string;
    type: PackageType;
    description: string;
    features: { id: number, text: string }[];
    createdAt: string;
}

interface PackagesState {
    packages: Package[];
    loading: boolean;
    error: string | null;
}

const initialState: PackagesState = {
    packages: [],
    loading: false,
    error: null,
};

export const getPackages = createAsyncThunk<Package[], void, { rejectValue: string }>(
    'packages/getAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get('/api/packages');
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch packages');
        }
    }
);

export const createPackage = createAsyncThunk<Package, any, { rejectValue: string }>(
    'packages/create',
    async (data, { rejectWithValue }) => {
        try {
            const response = await axios.post('/api/packages', data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create package');
        }
    }
);

export const updatePackage = createAsyncThunk<Package, { id: number, data: any }, { rejectValue: string }>(
    'packages/update',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await axios.put(`/api/packages/${id}`, data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update package');
        }
    }
);

export const deletePackage = createAsyncThunk<number, number, { rejectValue: string }>(
    'packages/delete',
    async (id, { rejectWithValue }) => {
        try {
            await axios.delete(`/api/packages/${id}`);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete package');
        }
    }
);

const PackagesSlice = createSlice({
    name: 'packages',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getPackages.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getPackages.fulfilled, (state, action) => {
                state.loading = false;
                state.packages = action.payload;
            })
            .addCase(getPackages.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(createPackage.fulfilled, (state, action) => {
                state.packages.unshift(action.payload);
            })
            .addCase(updatePackage.fulfilled, (state, action) => {
                state.packages = state.packages.map(p => p.id === action.payload.id ? action.payload : p);
            })
            .addCase(deletePackage.fulfilled, (state, action) => {
                state.packages = state.packages.filter(p => p.id !== action.payload);
            });
    },
});

export const packagesReducer = PackagesSlice.reducer;
