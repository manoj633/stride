import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { commentAPI } from "../../../services/api/urlService";

// Async thunks
export const createComment = createAsyncThunk(
  "comments/createComment",
  async (commentData) => {
    const response = await commentAPI.create(commentData);
    return response.data;
  }
);

export const fetchGoalComments = createAsyncThunk(
  "comments/fetchGoalComments",
  async (goalId) => {
    const response = await commentAPI.fetchByGoal(goalId);
    return response.data;
  }
);

export const updateComment = createAsyncThunk(
  "comments/updateComment",
  async ({ commentId, text }) => {
    const response = await commentAPI.update(commentId, { text });
    return response.data;
  }
);

export const deleteComment = createAsyncThunk(
  "comments/deleteComment",
  async (commentId) => {
    await commentAPI.delete(commentId);
    return commentId;
  }
);

const commentSlice = createSlice({
  name: "comments",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch comments cases
      .addCase(fetchGoalComments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchGoalComments.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchGoalComments.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      })
      // Create comment cases
      .addCase(createComment.pending, (state) => {
        state.loading = true;
      })
      .addCase(createComment.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.loading = false;
      })
      .addCase(createComment.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      })
      // Update comment cases
      .addCase(updateComment.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateComment.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (comment) => comment._id === action.payload._id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.loading = false;
      })
      .addCase(updateComment.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      })
      // Delete comment cases
      .addCase(deleteComment.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (comment) => comment._id !== action.payload
        );
        state.loading = false;
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      });
  },
});

export const { clearError } = commentSlice.actions;
export default commentSlice.reducer;
