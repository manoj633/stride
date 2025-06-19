// store/store.js
import { configureStore } from "@reduxjs/toolkit";
import tagReducer from "./features/tags/tagSlice";
import goalReducer from "./features/goals/goalSlice";
import taskReducer from "./features/tasks/taskSlice";
import subtaskReducer from "./features/subtasks/subtaskSlice";
import commentReducer from "./features/comments/commentSlice";
import authReducer from "./features/auth/authSlice";
import userReducer from "./features/users/userSlice";
import goalTemplateReducer from "./features/goalTemplates/goalTemplateSlice";

export const store = configureStore({
  reducer: {
    tags: tagReducer,
    goals: goalReducer,
    tasks: taskReducer,
    subtasks: subtaskReducer,
    comments: commentReducer,
    auth: authReducer,
    user: userReducer,
    goalTemplates: goalTemplateReducer,
  },
});

// Export store properties without TypeScript types
export const getState = store.getState;
export const dispatch = store.dispatch;
