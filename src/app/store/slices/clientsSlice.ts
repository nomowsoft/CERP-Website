import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchClients = createAsyncThunk(
    "clients/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get("/api/clients");
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || "Failed to fetch clients");
        }
    }
);

export const createClient = createAsyncThunk(
    "clients/create",
    async (clientData: { name: string, image?: string }, { rejectWithValue }) => {
        try {
            const response = await axios.post("/api/clients", clientData);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || "Failed to create client");
        }
    }
);

export const deleteClient = createAsyncThunk(
    "clients/delete",
    async (id: string, { rejectWithValue }) => {
        try {
            await axios.delete(`/api/clients/${id}`);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || "Failed to delete client");
        }
    }
);

interface ClientsState {
    clients: any[];
    loading: boolean;
    error: string | null;
}

const initialState: ClientsState = {
    clients: [],
    loading: false,
    error: null,
};

const clientsSlice = createSlice({
    name: "clients",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchClients.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchClients.fulfilled, (state, action) => {
                state.loading = false;
                state.clients = action.payload;
            })
            .addCase(fetchClients.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(createClient.fulfilled, (state, action) => {
                state.clients.unshift(action.payload);
            })
            .addCase(deleteClient.fulfilled, (state, action) => {
                state.clients = state.clients.filter(c => c.id !== action.payload);
            });
    },
});

export const clientsReducer = clientsSlice.reducer;
