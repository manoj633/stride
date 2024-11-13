// store/store.js
import { configureStore } from "@reduxjs/toolkit";
import tagReducer from "./features/tags/tagSlice";
import goalReducer from "./features/goals/goalSlice";

export const store = configureStore({
  reducer: {
    tags: tagReducer,
    goals: goalReducer,
    // Future reducers can be added here (e.g., goals)
  },
});

// Export store properties without TypeScript types
export const getState = store.getState;
export const dispatch = store.dispatch;
