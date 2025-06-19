import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { goalTemplateAPI } from "../../../services/api/urlService";

// Thunks
export const fetchGoalTemplates = createAsyncThunk(
  "goalTemplates/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await goalTemplateAPI.fetchAll();
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const createGoalTemplate = createAsyncThunk(
  "goalTemplates/create",
  async (templateData, { rejectWithValue }) => {
    try {
      const response = await goalTemplateAPI.create(templateData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateGoalTemplate = createAsyncThunk(
  "goalTemplates/update",
  async ({ id, templateData }, { rejectWithValue }) => {
    try {
      const response = await goalTemplateAPI.update(id, templateData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deleteGoalTemplate = createAsyncThunk(
  "goalTemplates/delete",
  async (id, { rejectWithValue }) => {
    try {
      await goalTemplateAPI.delete(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const goalTemplateSlice = createSlice({
  name: "goalTemplates",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGoalTemplates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGoalTemplates.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchGoalTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createGoalTemplate.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateGoalTemplate.fulfilled, (state, action) => {
        const idx = state.items.findIndex((t) => t._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteGoalTemplate.fulfilled, (state, action) => {
        state.items = state.items.filter((t) => t._id !== action.payload);
      });
  },
});

export default goalTemplateSlice.reducer;
