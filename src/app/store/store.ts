import { configureStore } from '@reduxjs/toolkit';
import thunk from 'redux-thunk';
import { userReducer } from './slices/userSlice';
import { subscriptionReducer } from './slices/subscriptionSlice';
import { usersReducer } from './slices/usersSlice';

export const store = configureStore({
    reducer: {
        user: userReducer,
        subscription: subscriptionReducer,
        users: usersReducer,
    },
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;