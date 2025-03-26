import { configureStore } from "@reduxjs/toolkit";
import sortingHatReducer from "./sortingHatSlice";

export const store = configureStore({
  reducer: {
    sortingHat: sortingHatReducer,
  },
});
