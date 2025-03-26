import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  answers: [],
};

const sortingHatSlice = createSlice({
  name: "sortingHat",
  initialState,
  reducers: {
    addAnswer: (state, action) => {
      state.answers.push(action.payload);
    },
    resetAnswers: (state) => {
      state.answers = [];
    },
  },
});

export const { addAnswer, resetAnswers } = sortingHatSlice.actions;
export default sortingHatSlice.reducer;
