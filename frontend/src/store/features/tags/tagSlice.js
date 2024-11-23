import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { tagAPI } from "../../../services/api/urlService";

export const fetchTags = createAsyncThunk("tags/fetchTags", async () => {
  const response = await tagAPI.fetchAll();
  return response.data;
});

export const createTag = createAsyncThunk("tags/createTag", async (tagData) => {
  const response = await tagAPI.create(tagData);
  return response.data;
});

export const updateTag = createAsyncThunk(
  "tags/updateTag",
  async ({ id, tagData }) => {
    const response = await tagAPI.update(id, tagData);
    return response;
  }
);

export const deleteTag = createAsyncThunk("tags/deleteTag", async (id) => {
  await tagAPI.delete(id);
  return id;
});

const tagSlice = createSlice({
  name: "tags",
  initialState: {
    items: [],
    loading: false,
    error: null,
    selectedTag: null,
  },
  reducers: {
    setSelectedTag: (state, action) => {
      state.selectedTag = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch tags cases
      .addCase(fetchTags.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTags.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchTags.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      })
      // Create tag cases
      .addCase(createTag.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(createTag.rejected, (state, action) => {
        state.error = action.error.message;
      })
      // Update tag cases
      .addCase(updateTag.fulfilled, (state, action) => {
        const updatedTag = action.payload;
        const index = state.tags.findIndex((tag) => tag._id === updatedTag._id);
        if (index !== -1) {
          state.tags[index] = updatedTag;
        }
      })
      // Delete tag cases
      .addCase(deleteTag.fulfilled, (state, action) => {
        state.items = state.items.filter((tag) => tag._id !== action.payload);
      });
  },
});

export const { setSelectedTag, clearError } = tagSlice.actions;
export default tagSlice.reducer;
