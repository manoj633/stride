// store/features/subtasks/subtaskSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { subtaskAPI } from "../../../services/api/urlService";

// Async Thunks
export const fetchSubtasks = createAsyncThunk(
  "subtasks/fetchSubtasks",
  async () => {
    const response = await subtaskAPI.fetchAll();
    return response.data;
  }
);

export const fetchSubtaskById = createAsyncThunk(
  "subtasks/fetchSubtaskById",
  async (id) => {
    const response = await subtaskAPI.fetchById(id);
    return response.data;
  }
);

export const createSubtask = createAsyncThunk(
  "subtasks/createSubtask",
  async (subtaskData) => {
    const response = await subtaskAPI.create(subtaskData);
    return response.data;
  }
);

export const updateSubtask = createAsyncThunk(
  "subtasks/updateSubtask",
  async ({ id, subtaskData }) => {
    const response = await subtaskAPI.update(id, subtaskData);
    return response.data;
  }
);

export const deleteSubtask = createAsyncThunk(
  "subtasks/deleteSubtask",
  async (id) => {
    await subtaskAPI.delete(id);
    return id;
  }
);

export const markSubtaskComplete = createAsyncThunk(
  "subtasks/markComplete",
  async (id) => {
    const response = await subtaskAPI.markComplete(id);
    return response.data;
  }
);

const subtaskSlice = createSlice({
  name: "subtasks",
  initialState: {
    items: [],
    loading: false,
    error: null,
    selectedSubtask: null,
  },
  reducers: {
    setSelectedSubtask: (state, action) => {
      state.selectedSubtask = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all subtasks cases
      .addCase(fetchSubtasks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSubtasks.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchSubtasks.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      })
      // Fetch single subtask cases
      .addCase(fetchSubtaskById.fulfilled, (state, action) => {
        state.selectedSubtask = action.payload;
      })
      // Create subtask cases
      .addCase(createSubtask.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(createSubtask.rejected, (state, action) => {
        state.error = action.error.message;
      })
      // Update subtask cases
      .addCase(updateSubtask.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (subtask) => subtask._id === action.payload._id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      // Delete subtask cases
      .addCase(deleteSubtask.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (subtask) => subtask._id !== action.payload
        );
      })
      // Mark complete cases
      .addCase(markSubtaskComplete.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (subtask) => subtask._id === action.payload._id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  },
});

export const { setSelectedSubtask, clearError } = subtaskSlice.actions;
export default subtaskSlice.reducer;
