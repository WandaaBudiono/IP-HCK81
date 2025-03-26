// Store/store.js
import { configureStore } from "@reduxjs/toolkit";
import sortingHatReducer from "./sortingHatSlice"; // slice lama
import charactersReducer from "./charactersSlice"; // slice baru

export const store = configureStore({
  reducer: {
    sortingHat: sortingHatReducer,
    characters: charactersReducer, // Tambahkan slice karakter di sini
  },
});
