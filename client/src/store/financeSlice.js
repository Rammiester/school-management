// Redux slice for managing finance data

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  financeData: {
    summary: {
      totalRevenue: 0,
      totalExpense: 0,
      netBalance: 0,
      pendingRequests: 0
    },
    requests: [],
    loading: false,
    error: null
  }
};

export const financeSlice = createSlice({
  name: "finance",
  initialState,
  reducers: {
    // Finance summary reducers
    setFinanceSummary: (state, action) => {
      state.financeData.summary = action.payload;
    },
    
    // Finance requests reducers
    setFinanceRequests: (state, action) => {
      state.financeData.requests = action.payload;
    },
    
    // Loading state reducers
    setFinanceLoading: (state, action) => {
      state.financeData.loading = action.payload;
    },
    
    // Error reducers
    setFinanceError: (state, action) => {
      state.financeData.error = action.payload;
    },
    
    // Add new request
    addFinanceRequest: (state, action) => {
      state.financeData.requests.push(action.payload);
    },
    
    // Update request
    updateFinanceRequest: (state, action) => {
      const index = state.financeData.requests.findIndex(req => req._id === action.payload._id);
      if (index !== -1) {
        state.financeData.requests[index] = action.payload;
      }
    },
    
    // Remove request
    removeFinanceRequest: (state, action) => {
      state.financeData.requests = state.financeData.requests.filter(req => req._id !== action.payload);
    }
  },
});

export const { 
  setFinanceSummary,
  setFinanceRequests,
  setFinanceLoading,
  setFinanceError,
  addFinanceRequest,
  updateFinanceRequest,
  removeFinanceRequest
} = financeSlice.actions;

// Selector functions
export const getFinanceSummary = (state) => state.finance.financeData.summary;
export const getFinanceRequests = (state) => state.finance.financeData.requests;
export const getFinanceLoading = (state) => state.finance.financeData.loading;
export const getFinanceError = (state) => state.finance.financeData.error;

export default financeSlice.reducer;
