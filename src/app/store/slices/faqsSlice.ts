import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export interface Faq {
    id: number;
    question_ar: string;
    question_en: string;
    answer_ar: string;
    answer_en: string;
    order: number;
    createdAt?: string;
    updatedAt?: string;
}

interface FaqsState {
    faqs: Faq[];
    loading: boolean;
    error: string | null;
}

const initialState: FaqsState = {
    faqs: [],
    loading: false,
    error: null,
};

export const getFaqs = createAsyncThunk<Faq[], void, { rejectValue: string }>(
    'faqs/getAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get('/api/faqs');
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch FAQs');
        }
    }
);

export const createFaq = createAsyncThunk<Faq, Partial<Faq>, { rejectValue: string }>(
    'faqs/create',
    async (data, { rejectWithValue }) => {
        try {
            const response = await axios.post('/api/faqs', data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create FAQ');
        }
    }
);

export const updateFaq = createAsyncThunk<Faq, { id: number, data: Partial<Faq> }, { rejectValue: string }>(
    'faqs/update',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await axios.put(`/api/faqs/${id}`, data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update FAQ');
        }
    }
);

export const deleteFaq = createAsyncThunk<number, number, { rejectValue: string }>(
    'faqs/delete',
    async (id, { rejectWithValue }) => {
        try {
            await axios.delete(`/api/faqs/${id}`);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete FAQ');
        }
    }
);

const faqsSlice = createSlice({
    name: 'faqs',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getFaqs.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getFaqs.fulfilled, (state, action) => {
                state.loading = false;
                state.faqs = action.payload;
            })
            .addCase(getFaqs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(createFaq.fulfilled, (state, action) => {
                state.faqs.push(action.payload);
            })
            .addCase(updateFaq.fulfilled, (state, action) => {
                state.faqs = state.faqs.map(faq => faq.id === action.payload.id ? action.payload : faq);
            })
            .addCase(deleteFaq.fulfilled, (state, action) => {
                state.faqs = state.faqs.filter(faq => faq.id !== action.payload);
            });
    },
});

export const faqsReducer = faqsSlice.reducer;
