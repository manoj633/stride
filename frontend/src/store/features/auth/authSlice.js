import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userInfo: localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo"))
    : null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.userInfo = action.payload;
      localStorage.setItem("userInfo", JSON.stringify(action.payload));
    },
    clearCredentials: (state) => {
      state.userInfo = null;
      localStorage.removeItem("userInfo");
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;

// Utility function to check if token is expired
export const checkTokenExpiration = () => (dispatch, getState) => {
  const { userInfo } = getState().auth;

  if (userInfo && userInfo.expiresAt) {
    const expirationTime = new Date(userInfo.expiresAt).getTime();
    const currentTime = new Date().getTime();

    if (currentTime > expirationTime) {
      // Token has expired, log the user out
      dispatch(clearCredentials());
      return true; // Token was expired
    }
  }
  return false; // Token is still valid
};

export default authSlice.reducer;
