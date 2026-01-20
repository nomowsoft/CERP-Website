import { createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';

interface UserState {
    userInfo: any[];
    loading: boolean;
    error: string | null;
}

const initialState: UserState = {
    userInfo: [],
    loading: false,
    error: null,
};

export const datauser = createAsyncThunk(
    'user/datauser',
    async () => {
        const {data} = await axios.get('/api/login');
        return data;
    }
);

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(datauser.pending, (state) => { // أثناء التحميل البيانات
                state.loading = true;
                state.error = null;
            })
            .addCase(datauser.fulfilled, (state, action) => { // عند نجاح جلب البيانات
                state.loading = false;
                state.userInfo = action.payload;
            })
            .addCase(datauser.rejected, (state, action) => { // عند فشل جلب البيانات
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});
export const userReducer = userSlice.reducer;
