// store/features/goals/goalSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { goalAPI } from "../../../services/api/urlService";

// Existing thunks remain the same
export const fetchGoals = createAsyncThunk("goals/fetchGoals", async () => {
  const response = await goalAPI.fetchAll();
  return response.data;
});

export const createGoal = createAsyncThunk(
  "goals/createGoal",
  async (goalData) => {
    const response = await goalAPI.create(goalData);
    return response.data;
  }
);

export const updateGoal = createAsyncThunk(
  "goals/updateGoal",
  async ({ id, goalData }) => {
    const response = await goalAPI.update(id, goalData);
    return response.data;
  }
);

export const deleteGoal = createAsyncThunk("goals/deleteGoal", async (id) => {
  await goalAPI.delete(id);
  return id;
});

// New thunk for filtering goals by tag
export const fetchGoalsByTag = createAsyncThunk(
  "goals/fetchByTag",
  async (tagId) => {
    const response = await goalAPI.fetchByTag(tagId);
    return response.data;
  }
);

export const deleteMultipleGoals = createAsyncThunk(
  "goals/deleteMultiple",
  async (goalIds) => {
    await goalAPI.deleteMultiple(goalIds);
    return goalIds;
  }
);

export const updateMultipleGoalsStatus = createAsyncThunk(
  "goals/updateMultipleStatus",
  async ({ goalIds, status }) => {
    const response = await goalAPI.updateMultipleStatus(goalIds, status);
    return response.data;
  }
);

export const updateGoalStatus = createAsyncThunk(
  "goals/updateStatus",
  async ({ id, status }) => {
    const response = await goalAPI.updateStatus(id, status);
    return response.data;
  }
);

export const archiveGoal = createAsyncThunk("goals/archiveGoal", async (id) => {
  await goalAPI.archive(id);
  return id;
});

export const archiveMultipleGoals = createAsyncThunk(
  "goals/archiveMultiple",
  async (goalIds) => {
    await goalAPI.archiveMultiple(goalIds);
    return goalIds;
  }
);

export const selectGoalStats = (state) => {
  const goals = state.goals.items;
  const now = new Date();

  return {
    completionRate: goals.length
      ? (goals.filter((g) => g.completionPercentage === 100).length /
          goals.length) *
        100
      : 0,

    overdueGoals: goals.filter(
      (g) =>
        new Date() > new Date(g.duration.endDate) &&
        g.completionPercentage < 100
    ).length,

    monthlyGoals: goals.filter((g) => {
      const startDate = new Date(g.duration.startDate);
      const endDate = new Date(g.duration.endDate);
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      return (
        (startDate.getMonth() === currentMonth &&
          startDate.getFullYear() === currentYear) ||
        (endDate.getMonth() === currentMonth &&
          endDate.getFullYear() === currentYear) ||
        (startDate <= now && endDate >= now)
      );
    }).length,
  };
};

export const updateGoalCompletion = createAsyncThunk(
  "goals/updateCompletion",
  async ({ goalId, subtasks }, { getState }) => {
    const state = getState();
    const goalSubtasks = state.subtasks.items.filter(
      (st) => st.goalId === goalId
    );

    const completedCount = goalSubtasks.filter((st) => st.completed).length;
    const completionPercentage =
      goalSubtasks.length > 0
        ? Number((completedCount / goalSubtasks.length) * 100).toFixed(2)
        : 0;

    const goal = state.goals.items.find((goal) => goal._id === goalId);
    const updatedGoal = {
      ...goal,
      completionPercentage,
      completed: completionPercentage === "100.00",
    };

    const response = await goalAPI.update(goalId, updatedGoal);
    return response.data;
  }
);

const goalSlice = createSlice({
  name: "goals",
  initialState: {
    items: [],
    loading: false,
    error: null,
    selectedGoal: null,
    selectedGoals: [],
    filteredGoals: [], // New state for filtered goals
    filterCriteria: null, // New state for tracking active filters
  },
  reducers: {
    setSelectedGoal: (state, action) => {
      state.selectedGoal = action.payload;
    },
    setSelectedGoals: (state, action) => {
      state.selectedGoals = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    // New reducers
    setFilterCriteria: (state, action) => {
      state.filterCriteria = action.payload;
    },
    clearFilters: (state) => {
      state.filteredGoals = [];
      state.filterCriteria = null;
    },
    sortGoals: (state, action) => {
      const { sortBy, direction } = action.payload;
      state.items.sort((a, b) => {
        return direction === "asc"
          ? a[sortBy] > b[sortBy]
            ? 1
            : -1
          : a[sortBy] < b[sortBy]
          ? 1
          : -1;
      });
    },
  },
  extraReducers: (builder) => {
    builder
      // Existing cases remain the same
      .addCase(fetchGoals.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchGoals.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchGoals.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      })
      .addCase(createGoal.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateGoal.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (goal) => goal._id === action.payload._id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteGoal.fulfilled, (state, action) => {
        state.items = state.items.filter((goal) => goal._id !== action.payload);
      })
      // New cases for fetchGoalsByTag
      .addCase(fetchGoalsByTag.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchGoalsByTag.fulfilled, (state, action) => {
        state.filteredGoals = action.payload;
        state.loading = false;
      })
      .addCase(fetchGoalsByTag.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      })
      .addCase(deleteMultipleGoals.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (goal) => !action.payload.includes(goal._id)
        );
        state.selectedGoals = [];
      })
      .addCase(updateMultipleGoalsStatus.fulfilled, (state, action) => {
        action.payload.forEach((updatedGoal) => {
          const index = state.items.findIndex(
            (goal) => goal._id === updatedGoal._id
          );
          if (index !== -1) {
            state.items[index] = updatedGoal;
          }
        });
        state.selectedGoals = [];
      })
      .addCase(updateGoalStatus.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (goal) => goal._id === action.payload._id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(archiveGoal.fulfilled, (state, action) => {
        state.items = state.items.filter((goal) => goal._id !== action.payload);
      })
      .addCase(archiveMultipleGoals.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (goal) => !action.payload.includes(goal._id)
        );
        state.selectedGoals = [];
      })
      .addCase(updateGoalCompletion.fulfilled, (state, action) => {
        const goalIndex = state.items.findIndex(
          (goal) => goal._id === action.payload.goalId
        );
        if (goalIndex !== -1) {
          state.items[goalIndex].completionPercentage =
            action.payload.completionPercentage;
          state.items[goalIndex].completed = action.payload.completed;
        }
      });
  },
});

export const {
  setSelectedGoal,
  setSelectedGoals,
  clearError,
  setFilterCriteria,
  clearFilters,
  sortGoals,
} = goalSlice.actions;

export default goalSlice.reducer;
