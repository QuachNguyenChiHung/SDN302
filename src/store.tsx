import { configureStore } from "@reduxjs/toolkit";
import reducer from "./slice";
const store = configureStore({
    reducer: reducer,
    devTools: import.meta.env.MODE !== 'production',
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
            },
        }),
});
export type RootState = ReturnType<typeof store.getState>
export type RootDispatch = typeof store.dispatch
export default store