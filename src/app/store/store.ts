import {configureStore} from '@reduxjs/toolkit';
import thunk from 'redux-thunk';
import { userReducer } from './slices/userSlice';
import { subscriptionReducer } from './slices/subscriptionSlice';

export const store = configureStore({
    reducer: {
        user: userReducer,
        subscription: subscriptionReducer,
    },
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;