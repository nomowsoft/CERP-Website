import { configureStore } from '@reduxjs/toolkit';
import thunk from 'redux-thunk';
import { userReducer } from './slices/userSlice';
import { subscriptionReducer } from './slices/subscriptionSlice';
import { usersReducer } from './slices/usersSlice';
import { packagesReducer } from './slices/packagesSlice';
import { servicesReducer } from './slices/servicesSlice';

export const store = configureStore({
    reducer: {
        user: userReducer,
        subscription: subscriptionReducer,
        users: usersReducer,
        packages: packagesReducer,
        services: servicesReducer,
    },
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;