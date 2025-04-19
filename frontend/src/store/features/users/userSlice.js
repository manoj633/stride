import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { userAPI } from "../../../services/api/urlService"; // Adjust the import path as needed

// Helper function to handle localStorage
const setUserToStorage = (userData) => {
  localStorage.setItem("userInfo", JSON.stringify(userData));
};

// Async thunks
export const login = createAsyncThunk(
  "users/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await userAPI.login(credentials);
      setUserToStorage(data);
      return data;
    } catch (err) {
      return rejectWithValue(err.response.data.message);
    }
  }
);

export const register = createAsyncThunk(
  "users/register",
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await userAPI.register(userData);
      setUserToStorage(data);
      return data;
    } catch (err) {
      return rejectWithValue(err.response.data.message);
    }
  }
);

export const logout = createAsyncThunk(
  "users/logout",
  async (_, { rejectWithValue }) => {
    try {
      await userAPI.logout();
      localStorage.removeItem("userInfo");
    } catch (err) {
      return rejectWithValue(err.response.data.message);
    }
  }
);

export const updateProfile = createAsyncThunk(
  "users/profile/update",
  async (userData, { rejectWithValue }) => {
    try {
      // Only send the fields that are actually provided
      const { data } = await userAPI.updateProfile(userData);
      setUserToStorage(data);
      return data;
    } catch (err) {
      return rejectWithValue(err.response.data.message);
    }
  }
);

// Admin thunks
export const getUsers = createAsyncThunk(
  "users/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await userAPI.getAllUsers();
      return data;
    } catch (err) {
      return rejectWithValue(err.response.data.message);
    }
  }
);

export const generateTwoFactorSecret = createAsyncThunk(
  "users/generateTwoFactorSecret",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await userAPI.generateTwoFactorSecret();
      return data;
    } catch (err) {
      return rejectWithValue(err.response.data.message);
    }
  }
);

// In your userActions.js or where you define your Redux actions
export const verifyAndEnableTwoFactor = createAsyncThunk(
  "user/verifyAndEnableTwoFactor",
  async (tokenData, { rejectWithValue }) => {
    try {
      // Make sure you're sending the token as an object with the expected property name
      const { data } = await userAPI.verifyAndEnableTwoFactor({
        token: tokenData.token,
      });

      // Update localStorage with new user info
      localStorage.setItem(
        "userInfo",
        JSON.stringify({
          ...JSON.parse(localStorage.getItem("userInfo")),
          isTwoFactorEnabled: true,
        })
      );

      return data;
    } catch (err) {
      return rejectWithValue(
        err.response && err.response.data.message
          ? err.response.data.message
          : err.message
      );
    }
  }
);

export const disableTwoFactor = createAsyncThunk(
  "users/disableTwoFactor",
  async (password, { rejectWithValue }) => {
    try {
      const { data } = await userAPI.disableTwoFactor({ password });
      // Update user info in storage with 2FA disabled
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (userInfo) {
        userInfo.isTwoFactorEnabled = false;
        localStorage.setItem("userInfo", JSON.stringify(userInfo));
      }
      return data;
    } catch (err) {
      return rejectWithValue(err.response.data.message);
    }
  }
);

export const validateTwoFactorAuth = createAsyncThunk(
  "users/validateTwoFactorAuth",
  async ({ email, token, isBackupCode }, { rejectWithValue }) => {
    try {
      const { data } = await userAPI.validateTwoFactorAuth({
        email,
        token,
        isBackupCode,
      });
      localStorage.setItem("userInfo", JSON.stringify(data));
      return data;
    } catch (err) {
      return rejectWithValue(err.response.data.message);
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    twoFactorSetup: {
      qrCodeUrl: null,
      secret: null,
      backupCodes: [],
      loading: false,
      error: null,
    },
    userInfo: localStorage.getItem("userInfo")
      ? JSON.parse(localStorage.getItem("userInfo"))
      : null,
    users: [], // for admin users list
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    clearTwoFactorSetup(state) {
      state.twoFactorSetup = {
        qrCodeUrl: null,
        secret: null,
        backupCodes: [],
        loading: false,
        error: null,
      };
    },
    clearError: (state) => {
      state.error = null;
    },
    resetSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Generate secret
      .addCase(generateTwoFactorSecret.pending, (state) => {
        state.twoFactorSetup.loading = true;
        state.twoFactorSetup.error = null;
      })
      .addCase(generateTwoFactorSecret.fulfilled, (state, action) => {
        state.twoFactorSetup.loading = false;
        state.twoFactorSetup.qrCodeUrl = action.payload.qrCodeUrl;
        state.twoFactorSetup.secret = action.payload.secret;
      })
      .addCase(generateTwoFactorSecret.rejected, (state, action) => {
        state.twoFactorSetup.loading = false;
        state.twoFactorSetup.error = action.payload;
      })
      // Verify and enable
      .addCase(verifyAndEnableTwoFactor.pending, (state) => {
        state.twoFactorSetup.loading = true;
        state.twoFactorSetup.error = null;
      })
      .addCase(verifyAndEnableTwoFactor.fulfilled, (state, action) => {
        state.twoFactorSetup.loading = false;
        state.twoFactorSetup.backupCodes = action.payload.backupCodes;
        if (state.userInfo) {
          state.userInfo.isTwoFactorEnabled = true;
        }
      })
      .addCase(verifyAndEnableTwoFactor.rejected, (state, action) => {
        state.twoFactorSetup.loading = false;
        state.twoFactorSetup.error = action.payload;
      })
      // Disable
      .addCase(disableTwoFactor.fulfilled, (state) => {
        if (state.userInfo) {
          state.userInfo.isTwoFactorEnabled = false;
        }
        state.twoFactorSetup = {
          qrCodeUrl: null,
          secret: null,
          backupCodes: [],
          loading: false,
          error: null,
        };
      })
      // Validate 2FA
      .addCase(validateTwoFactorAuth.fulfilled, (state, action) => {
        state.userInfo = action.payload;
        state.loading = false;
      })
      .addCase(validateTwoFactorAuth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
        // Store 2FA setup data if available
        if (action.payload.twoFactorAuthSetup) {
          state.twoFactorSetup.qrCodeUrl =
            action.payload.twoFactorAuthSetup.qrCodeUrl;
          state.twoFactorSetup.secret =
            action.payload.twoFactorAuthSetup.secret;
        }
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.userInfo = null;
        state.users = [];
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
        state.success = true;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Users (admin)
      .addCase(getUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, resetSuccess, clearTwoFactorSetup } =
  userSlice.actions;
export default userSlice.reducer;
