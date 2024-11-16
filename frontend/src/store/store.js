// store/store.js
import { configureStore } from "@reduxjs/toolkit";
import tagReducer from "./features/tags/tagSlice";
import goalReducer from "./features/goals/goalSlice";
import taskReducer from "./features/tasks/taskSlice";
import subtaskReducer from "./features/subtasks/subtaskSlice";

export const store = configureStore({
  reducer: {
    tags: tagReducer,
    goals: goalReducer,
    tasks: taskReducer,
    subtasks: subtaskReducer,
    // Future reducers can be added here (e.g., goals)
  },
});

// Export store properties without TypeScript types
export const getState = store.getState;
export const dispatch = store.dispatch;
