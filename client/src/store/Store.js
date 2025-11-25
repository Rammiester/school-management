import { configureStore } from "@reduxjs/toolkit";
import h1Slice from "./h1Slice";
import feedbackSlice from "./feedbackSlice";

export const store = configureStore({
  reducer: {
    h1: h1Slice,
    feedback: feedbackSlice,
  },
});
