// Redux slice for managing selected dropdown value

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedDropdownValue: "Trixeo",
  isDarkMode: false,
  pendingUsers: [],
  pendingUsersLoading: false,
  pendingUsersError: null,
};

export const h1Slice = createSlice({
  name: "h1",
  initialState,
  reducers: {
    setSelectedDropdownValue: (state, action) => {
      state.selectedDropdownValue = action.payload;
    },
    setThemeSwitchValue: (state, action) => {
      state.isDarkMode = action.payload;
    },
    // Pending users reducers
    setPendingUsers: (state, action) => {
      state.pendingUsers = action.payload;
    },
    setPendingUsersLoading: (state, action) => {
      state.pendingUsersLoading = action.payload;
    },
    setPendingUsersError: (state, action) => {
      state.pendingUsersError = action.payload;
    },
    addPendingUser: (state, action) => {
      state.pendingUsers.push(action.payload);
    },
    removePendingUser: (state, action) => {
      state.pendingUsers = state.pendingUsers.filter(user => user._id !== action.payload);
    },
  },
});
export const { 
  setSelectedDropdownValue, 
  setThemeSwitchValue,
  setPendingUsers,
  setPendingUsersLoading,
  setPendingUsersError,
  addPendingUser,
  removePendingUser
} = h1Slice.actions;
// Selector functions
export const getSelectedDropdownValue = (state) => state.h1.selectedDropdownValue;
export const getThemeSwitchValue = (state) => state.h1.isDarkMode;
export const getPendingUsers = (state) => state.h1.pendingUsers;
export const getPendingUsersLoading = (state) => state.h1.pendingUsersLoading;
export const getPendingUsersError = (state) => state.h1.pendingUsersError;

export default h1Slice.reducer;
