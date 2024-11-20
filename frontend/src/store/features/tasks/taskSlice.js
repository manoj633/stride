// store/features/tasks/taskSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { taskAPI } from "../../../services/api/urlService";

// Async Thunks
export const fetchTasks = createAsyncThunk("tasks/fetchTasks", async () => {
  const response = await taskAPI.fetchAll();
  return response.data;
});

export const fetchTaskById = createAsyncThunk(
  "tasks/fetchTaskById",
  async (id) => {
    const response = await taskAPI.fetchById(id);
    return response.data;
  }
);

export const createTask = createAsyncThunk(
  "tasks/createTask",
  async (taskData) => {
    const response = await taskAPI.create(taskData);
    return response.data;
  }
);

export const updateTask = createAsyncThunk(
  "tasks/updateTask",
  async ({ id, taskData }) => {
    const response = await taskAPI.update(id, taskData);
    return response.data;
  }
);

export const deleteTask = createAsyncThunk("tasks/deleteTask", async (id) => {
  await taskAPI.delete(id);
  return id;
});

export const updateTaskCompletion = createAsyncThunk(
  "tasks/updateCompletion",
  async ({ taskId, subtasks }, { getState }) => {
    const state = getState();
    const taskSubtasks = state.subtasks.items.filter(
      (st) => st.taskId === taskId
    );

    const completedCount = taskSubtasks.filter((st) => st.completed).length;
    const completionPercentage =
      taskSubtasks.length > 0
        ? (completedCount / taskSubtasks.length) * 100
        : 0;
    console.log(completionPercentage);

    const task = state.tasks.items.find((task) => task._id === taskId);
    const updatedTask = { ...task, completionPercentage };

    const response = await taskAPI.update(taskId, updatedTask);
    return response.data;
  }
);

const taskSlice = createSlice({
  name: "tasks",
  initialState: {
    items: [],
    loading: false,
    error: null,
    selectedTask: null,
  },
  reducers: {
    setSelectedTask: (state, action) => {
      state.selectedTask = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all tasks cases
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      })
      // Fetch single task cases
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        state.selectedTask = action.payload;
      })
      // Create task cases
      .addCase(createTask.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.error = action.error.message;
      })
      // Update task cases
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (task) => task._id === action.payload._id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      // Delete task cases
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.items = state.items.filter((task) => task._id !== action.payload);
      })
      // Update task completion cases
      .addCase(updateTaskCompletion.fulfilled, (state, action) => {
        const taskIndex = state.items.findIndex(
          (task) => task._id === action.payload.taskId
        );
        if (taskIndex !== -1) {
          state.items[taskIndex].completionPercentage =
            action.payload.completionPercentage;
          state.items[taskIndex].completed = action.payload.completed;
        }
      });
  },
});

export const selectTasksByGoalId = (state, goalId) =>
  state.tasks.items.filter((task) => task.goalId === goalId);

export const { setSelectedTask, clearError } = taskSlice.actions;
export default taskSlice.reducer;
